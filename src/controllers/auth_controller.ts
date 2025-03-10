import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { IUser, userModel } from '../models/users_model';
import { Document } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';

export const hashPassword = async(password: string) => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch {
        throw new Error('Error With Hash Password');
    }
}

export const register = async (req: Request, res: Response) => {
    try {
        const { password, userName, email, firstName, lastName, phone_number, date_of_birth, profile_picture_uri, gender } = req.body
        const hashedPassword = await hashPassword(password);
        const user = await userModel.create({
            email,
            password: hashedPassword,
            userName: userName,
            firstName: firstName ?? null,
            lastName: lastName ?? null,
            phone_number: phone_number ?? null,
            date_of_birth: date_of_birth ?? null,
            profile_picture_uri: profile_picture_uri ?? null,
            gender: gender ?? null,
        });
        res.status(200).send(user);
    } catch (err) {
        res.status(400).send(err);
    }
};

type tTokens = {
    accessToken: string,
    refreshToken: string
}

export const generateToken = (userId: string): tTokens | null => {
    if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
        return null;
    }
    // generate token
    const random = Math.random().toString();
    const accessToken = jwt.sign({
        _id: userId,
        random: random
    },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.JWT_TOKEN_EXPIRATION });

    const refreshToken = jwt.sign({
        _id: userId,
        random: random
    },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
    return {
        accessToken: accessToken,
        refreshToken: refreshToken
    };
};

export const login = async (req: Request, res: Response) => {
    try {
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            res.status(400).send('wrong email or password');
            return;
        }
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            res.status(400).send('wrong email or password');
            return;
        }
        if (!process.env.ACCESS_TOKEN_SECRET) {
            res.status(500).send('Server Error');
            return;
        }
        // generate tokens
        const tokens = generateToken(user._id);
        if (!tokens) {
            res.status(500).send('Server Error');
            return;
        }
        if (!user.refreshToken) {
            user.refreshToken = [tokens.refreshToken];
        } else {
            user.refreshToken.push(tokens.refreshToken);
        }

        user.is_connected = true;
        await user.save();
        res.status(200).send({ 
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            _id: user._id 
        });
    } catch (err) {
        res.status(400).send(err);
    }
};

export type tUser = Document<unknown, object, IUser> & IUser & Required<{
    _id: string;
}> & {
    __v: number;
}
export const verifyRefreshToken = (refreshToken: string | undefined) => {
    return new Promise<tUser>((resolve, reject) => {
        //get refresh token from body
        if (!refreshToken) {
            reject("fail");
            return;
        }
        //verify token
        if (!process.env.REFRESH_TOKEN_SECRET) {
            reject("fail");
            return;
        }
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err: Error, payload: { _id: string }) => {
            if (err) {
                reject("fail");
                return
            }
            //get the user id fromn token
            const userId = payload._id;
            
            try {
                //get the user form the db
                const user = await userModel.findById(userId);                
                if (!user) {
                    reject("fail");
                    return;
                }

                if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
                    user.refreshToken = [];
                    await user.save();
                    
                    reject("fail");
                    return;
                }
                const tokens = user.refreshToken!.filter((token) => token !== refreshToken);
                // const tokens = user.refreshToken.filter((token) => token !== refreshToken);
                user.refreshToken = tokens;

                resolve(user);
            } catch {
                reject("fail");
                return;
            }
        });
    });
}

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const user = await verifyRefreshToken(req.body.refreshToken);
        if (!user) {
            res.status(400).send("fail");
            return;
        }
        const tokens = generateToken(user._id);

        if (!tokens) {
            res.status(500).send('Server Error');
            return;
        }
        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        user.refreshToken.push(tokens.refreshToken);
        await user.save();
        
        res.status(200).send(
            {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                _id: user._id
            });
        //send new token
    } catch {
        res.status(500).send("fail");
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const user = await verifyRefreshToken(req.body.refreshToken);

        user.is_connected = false;
        await user.save();
        res.status(200).send("success");
    } catch {
        res.status(400).send("fail");
    }
};

type Payload = {
    _id: string;
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.header('authorization');
    const token = authorization && authorization.split(' ')[1];

    if (!token) {
        res.status(401).send('Access Denied');
        return;
    }
    if (!process.env.ACCESS_TOKEN_SECRET) {
        res.status(500).send('Server Error');
        return;
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            res.status(401).send('Access Denied');
            return;
        }
        req.params.userId = (payload as Payload)._id;
        next();
    });
};

export const client = new OAuth2Client();
export const googleSignin = async (req: Request, res: Response) => {    
    try {
        if (!req.body.credential) {
            res.status(400).send("Missing credential in request");
        } else {
            const ticket = await client.verifyIdToken({
                idToken: req.body.credential,
                audience: process.env.GOOGLE_CLIENT_ID,
                });
        
                const payload = ticket.getPayload();
                if (!payload || !payload.email) {
                    console.log("No email received from Google");
                    res.status(400).send("Invalid Google token: Missing email");
                } else {
                    const email = payload?.email;
                    console.log("Google Payload:", payload);
                    
                    if (email != null) {
                        let user = await userModel.findOne({ email: email });
                        
                        if (user == null || !user) {
                            console.log("Creating new user...");
            
                            user = await userModel.create({
                            email: email,
                            userName: payload.email.split('@')[0],
                            password: "google-signin",
                            profile_picture_uri: payload?.picture ? payload?.picture : null,
                            });
                        }
                        
                        const tokens = await generateToken(user._id);
                        console.log("Successfully signed in with Google:", { email: user.email, _id: user._id });
            
                        res.status(200).send({
                            email: user.email,
                            _id: user._id,
                            profile_picture_uri: user.profile_picture_uri,
                            ...tokens,
                        });
                    }
                }
        }
    } catch {
        // console.error("Google Sign-In Error:");
        res.status(500).send("Server Error");
    }
};
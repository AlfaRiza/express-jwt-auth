import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ['id', 'name', 'email']
        });
        res.json(users);
    } catch (error) {
        console.log();
    }
}

export const Register = async (req, res) => {
    const { name, email, password, confirm_password } = req.body;

    if (password != confirm_password) return res.status(400).json({ msg: "Password dan confirm password tidak cocok" });

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    try {
        await Users.create({
            name: name,
            email: email,
            password: hashPassword,
        });
        res.status(201).json({ msg: "Register Berhasil" });
    } catch (error) {
        console.log(error);
    }
}

export const Login = async (req, res) => {
    try {
        const user = await Users.findAll({
            where: {
                email: req.body.email,
            }
        });

        const match = await bcrypt.compare(req.body.password, user[0].password);

        if (!match) return res.status(422).json({ msg: "Password salah" });

        const UserId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;

        const access_token = jwt.sign({
            UserId, name, email
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '20s',
        });
        const refresh_token = jwt.sign({
            UserId, name, email
        }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d',
        });

        await Users.update({
            refresh_token: refresh_token
        }, {
            where: {
                id: UserId,
            }
        });

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            // secure: true
        });

        res.json({ access_token })
    } catch (error) {
        res.status(422).json({ msg: "Email tidak ditemukan" });
    }
}

export const Logout = async (req, res) => {
    try {
        const refresh_token = req.cookies.refresh_token;
        if (!refresh_token) return res.sendStatus(204);
        const user = await Users.findAll({
            where: {
                refresh_token: refresh_token
            }
        });

        if (!user[0]) return res.sendStatus(204);

        const UserId = user[0].id;
        await Users.update({
            refresh_token: null,
        }, {
            where: {
                id: UserId
            }
        });

        res.clearCookie('refresh_token');
        return res.sendStatus(200);

    } catch (error) {

    }
}

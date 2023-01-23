import dotenv from "dotenv";
import express, { json } from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import { postLoginSchemas, postRecordsSchemas, postUsersSchemas } from "./schemas.js";
import { v4 as uuidv4 } from "uuid";
import { getDate } from "./getDate.js";

dotenv.config();

const server = express();
server.use(cors());
server.use(json());

const PORT = 5000;

const mongoClient = new MongoClient(process.env.DATABASE_URL);

let db;

try {
    await mongoClient.connect();
    console.log("Conectado ao Banco de Dados");

} catch (error) {
    console.log(error.message);
}

db = mongoClient.db();

server.post('/sign-up', async (req, res) => {
    const { nome, email, password } = req.body;

    const { error } = postUsersSchemas.validate({ nome, email, password });

    if (error) return res.status(422).send(error.message);

    const passwordHashed = bcrypt.hashSync(password, 10);
    try {
        const checkSignUp = !!await db.collection('users').findOne({ email });
        if (checkSignUp) return res.sendStatus(409);

        const token = uuidv4();

        await db.collection("users").insertOne({ nome, email, password: passwordHashed, token });
        res.status(201).send("Usuario cadastrado");
    }
    catch (error) {
        res.send(error.message);
    }
});

server.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const { error } = postLoginSchemas.validate({ email, password });

    if (error) return res.status(422).send(error.message);

    try {
        const checkUser = await db.collection("users").findOne({ email });

        const isCorrectPassword = bcrypt.compareSync(password, checkUser.password);

        if (!checkUser || !isCorrectPassword) return res.status(400).send("Usuário ou senha incorretos");

        await db.collection("sessions").insertOne({ idUser: checkUser._id, token: checkUser.token });

        res.status(200).send(checkUser);
    }
    catch (error) {
        res.send(error.message);
    }

});

server.post('/records', async (req, res) => {
    const { text, value, type } = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    const { error } = postRecordsSchemas.validate({ text, value, type });

    if (error) return res.status(422).send(error.message);


    if (!token) return res.status(422).send("Informe o token");

    try {
        const checkAuthorization = await db.collection("sessions").findOne({ token });
        if (!checkAuthorization) return res.status(401).send("Não autorizado");
        await db.collection("records").insertOne({
            idUser: checkAuthorization.idUser,
            date: getDate(),
            text,
            value,
            type
        });

        res.status(201).send("Registro armazenado");

    } catch (error) {
        res.send(error.message);
    }


});

server.get('/records', async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).send("Não autorizado");

    try {
        const records = await db.collection("/records").find({ token }).toArray();
        res.status(200).send(records);
    } catch (error) {
        res.send(error.message);
    }


});
server.listen(PORT, () => {
    console.log(`Servidor funcionando na porta ${PORT}`);
});
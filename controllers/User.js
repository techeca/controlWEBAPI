import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt'

export async function CreateUser(req, res, next) {
    const prisma = new PrismaClient();
    try {
        const { correo, rut, nombre, tipo, contrasena } = req.body;
        if (!correo || !rut || !nombre || !tipo || !contrasena) return next(new Error("Error al obtener datos de usuario"))
        const userExist = await FindUserByRUT(rut, false);
        //Si encuentra un usuario envía 409 y error: 'Usuario ya registrado'   
        if (userExist) { return res.status(409).json({ error: "Usuario ya registrado" }) }

        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const newUserData = {
            email: correo,
            rut: rut,
            name: nombre,
            password: hashedPassword, // Guardar la contraseña hasheada
            type: tipo
        };

        //Registra nuevo usuario, envía 200 y result: user
        const newUser = await prisma.user.create({ data: newUserData })
        res.status(200).json({ result: newUser })
    } catch (error) {
        console.error(error);
        next("Error al crear el usuario")
    } finally {
        prisma.$disconnect();
    }
}

export async function ReadUser(req, res, next) {
    try {
        const { rut } = req.body;
        if (!rut) return next(new Error("Error al obtener datos de usuario"))
        const userData = await FindUserByRUT(userRUT, false);
        //Si No encuentra usuario envía 404 y error: "Usuario no encontrado"
        if (!userData) { res.status(404).json({ error: 'Usuario no encontrado' }) }
        //Si encuentra un usuario envía 200 con sus datos
        res.status(200).json({ result: userData })
    } catch (error) {
        //En caso de error va a middleware "Error al crear el usuario"
        console.error(error);
        next(new Error("Error al buscar el usuario"))
    }
}

async function FindUserByRUT(rut, withControls) {
    if (!rut) throw new Error("Error al obtener la ip del usuario")
    const prisma = new PrismaClient()
    try {
        const user = await prisma.user.findFirst({
            where: { rut: rut },
            include: {
                controles: withControls
            }
        })
        return user
    } catch (error) {
        console.error(error);
        return null
    } finally {
        prisma.$disconnect()
    }
}
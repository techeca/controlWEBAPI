import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt'

export async function CreateUser(req, res, next) {
    const prisma = new PrismaClient();
    try {
        const { correo, rut, nombre, tipo, contrasena, apellido, segundoApellido, segundoNombre, cargo } = req.body;
        if (!correo || !rut || !nombre || !tipo || !contrasena || !apellido) return next(new Error("Error al obtener datos de usuario"))
        const userExist = await FindUserByRUT(rut, false);
        //Si encuentra un usuario envía 409 y error: 'Usuario ya registrado'   
        if (userExist) { return next({ status: 409, message: "Usuario ya registrado" }) }

        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const newUserData = {
            email: correo,
            rut: rut,
            name: nombre,
            password: hashedPassword, // Guardar la contraseña hasheada
            type: tipo,
            lastName: apellido,
            surName: segundoApellido,
            secondName: segundoNombre,
            cargo: cargo
        };

        //Registra nuevo usuario, envía 200 y result: user
        const newUser = await prisma.user.create({ data: newUserData })
        res.status(200).json({ result: newUser })
    } catch (error) {
        next({ status: 500, message: "Error interno al crear el usuario", details: error.message });
    } finally {
        prisma.$disconnect();
    }
}

export async function ReadUser(req, res, next) {
    const { rut } = req.body;
    try {
        if (!rut) return next(new Error("Error al obtener datos de usuario"))
        const userData = await FindUserByRUT(userRUT, false);
        //Si No encuentra usuario envía 404 y error: "Usuario no encontrado"
        if (!userData) { res.status(404).json({ error: 'Usuario no encontrado' }) }
        //Si encuentra un usuario envía 200 con sus datos
        res.status(200).json({ result: userData })
    } catch (error) {
        console.error(error);
        next({ status: 500, message: "Error al buscar el usuario", details: error.message })
    }
}

export async function DeleteUser(req, res, next){
    const prisma = new PrismaClient();
    const { rut } = req.params;
    try {
        await prisma.user.delete({
            where: { rut: rut}
        })
        res.status(200).json({ message: "Usuario eliminado"})
    } catch (error) {
        next({ status: 500, message: "Error al eliminar el usuario", details: error.message})
    }
}

export async function GetAllUsers(req, res, next){
    const prisma = new PrismaClient()
    try {
        const allUsers = await prisma.user.findMany()
        res.status(200).json({ result: allUsers})
    } catch (error) {
        next({ status: 500, message: "Error al obtener los usuarios", details: error.message})
    } finally {
        prisma.$disconnect();
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
        return null
    } finally {
        prisma.$disconnect()
    }
}
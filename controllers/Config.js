import { PrismaClient } from "@prisma/client"

export async function getConfig(req, res, next){
    const prisma = new PrismaClient()
    try {
        const days = await prisma.days.findMany();
        res.status(200).json({ result: days })
    } catch (error) {
        console.log(error);
        next({ status: 500, message: "Error al obtener la configuración de la plataforma", details: error.message })
    } finally {
        prisma.$disconnect();
    }
}

export async function DatesConfig(req, res, next){
    const { dates } = req.body
    try {
        
    } catch (error) {
        console.log(error);
    }
}

export async function DaysConfig(req, res, next){
    const { days } = req.body
    try {
        
    } catch (error) {
        console.log(error);
    }
}
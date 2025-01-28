import { PrismaClient } from "@prisma/client"

export async function getConfig(req, res, next) {
    const prisma = new PrismaClient()
    try {
        const days = await prisma.days.findMany();
        res.status(200).json({ result: days })
    } catch (error) {
        console.log(error);
        next({ status: 500, message: "Error al obtener la configuración de la plataforma", details: error.message })
    } finally {
        await prisma.$disconnect();
    }
}

export async function DatesConfig(req, res, next) {
    const { dates } = req.body
    try {

    } catch (error) {
        console.log(error);
    }
}

export async function daysConfig(req, res, next) {
    const days = req.body
    const prisma = new PrismaClient()
    try {
        console.log(days);
        // Iterar sobre los días y actualizar la base de datos
        const updatePromises = Object.entries(days).map(([day, isExcluded]) =>
            prisma.days.updateMany({
                where: { Day: day },
                data: { isExcluded },
            })
        );

        // Esperar a que todas las actualizaciones se completen
        await Promise.all(updatePromises);
        res.status(200).json({ result: updatePromises })
    } catch (error) {
        console.log(error);
        next({ status: 500, message: "Error al intentar actualizar los días de turno", details: error.message })
    } finally {
        await prisma.$disconnect();
    }
}
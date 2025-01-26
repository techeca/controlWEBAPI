import { PrismaClient } from "@prisma/client";
import { ROLES } from "../utils/contants.js";

export async function CreateControl(req, res, next) {
    const prisma = new PrismaClient();
    try {
        const { tipo } = req.body;
        const { userId } = req.user;
        if (!tipo) return res.status(400).json({ message: "No se proporcionó el tipo de control" });
        const userExist = await FindUserById(userId);
        if (!userExist) return res.status(404).json({ message: "El usuario no existe" });
        const controlExist = await CheckIfTodayControlExists(tipo, userId);
        if (controlExist) return res.status(400).json({ message: `Ya existe un control de ${tipo} para el día de hoy` });
        const newControlData = {
            typeControl: tipo,
            userId: userId
        }
        const newControl = await prisma.control.create({ data: newControlData });
        res.status(201).json({ result: newControl });
    } catch (error) {
        console.log(error);
        next({ status: 500, message: "Error interno al crear el control", details: error.message });
    } finally {
        prisma.$disconnect();
    }
}

export async function GetAllControls(req, res, next) {
    const prisma = new PrismaClient();
    try {
        //const { userId } = req.user;
        const { page = 1, pageSize = 10 } = req.query;

        // Convertimos los valores a números para evitar errores
        const pageNumber = parseInt(page, 10);
        const pageSizeNumber = parseInt(pageSize, 10);

        // Calculamos el offset y limit
        const skip = (pageNumber - 1) * pageSizeNumber;

        // Obtenemos los controles paginados
        const controls = await prisma.control.findMany({
            //where: { userId: userId },
            skip: skip,
            take: pageSizeNumber,
            where: {
                user: {
                    type: ROLES.USER
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        secondName: true,
                        lastName: true,
                        surName: true,
                        cargo: true,
                        email: true
                    }
                }
            }
        });

        // Obtenemos el número total de controles
        const totalControls = await prisma.control.count({
            where: {
                user: {
                    type: "USER"
                }
            }
        });

        // Agrupar los controles por mes
        const chartData = Array.from({ length: 12 }, (_, index) => {
            const month = index + 1; // Los meses van del 1 al 12
            const monthControls = controls.filter(control => {
                const controlMonth = new Date(control.createdAt).getMonth() + 1; // Obtener el mes del control
                return controlMonth === month;
            });

            const asistencias = monthControls.filter(control => control.typeControl === "ENTRADA").length;
            const inasistencias = monthControls.filter(control => control.typeControl === "SALIDA").length;

            return {
                month: new Date(0, month - 1).toLocaleString('default', { month: 'long' }), // Obtener nombre del mes
                asistencias,
                inasistencias
            };
        });

        // Calculamos información de la paginación
        const totalPages = Math.ceil(totalControls / pageSizeNumber);
        const hasNextPage = pageNumber < totalPages;
        const hasPrevPage = pageNumber > 1;

        res.status(200).json({
            result: controls,
            chartData: chartData,
            pagination: {
                currentPage: pageNumber,
                pageSize: pageSizeNumber,
                totalItems: totalControls,
                totalPages: totalPages,
                hasNextPage: hasNextPage,
                hasPrevPage: hasPrevPage,
                nextPage: hasNextPage ? pageNumber + 1 : null,
                prevPage: hasPrevPage ? pageNumber - 1 : null,
            },
        });
    } catch (error) {
        console.error(error);
        next({ status: 500, message: "Error interno al obtener los controles", details: error.message });
    } finally {
        await prisma.$disconnect();
    }
}

export async function GetControls(req, res, next) {
    const prisma = new PrismaClient();
    try {
        const { userId } = req.user;
        const { page = 1, pageSize = 10 } = req.query;

        // Convertimos los valores a números para evitar errores
        const pageNumber = parseInt(page, 10);
        const pageSizeNumber = parseInt(pageSize, 10);

        // Calculamos el offset y limit
        const skip = (pageNumber - 1) * pageSizeNumber;

        // Obtenemos los controles paginados
        const controls = await prisma.control.findMany({
            where: { userId: userId },
            skip: skip,
            take: pageSizeNumber,
        });

        // Obtenemos el número total de controles
        const totalControls = await prisma.control.count({
            where: { userId: userId },
        });

        // Calculamos información de la paginación
        const totalPages = Math.ceil(totalControls / pageSizeNumber);
        const hasNextPage = pageNumber < totalPages;
        const hasPrevPage = pageNumber > 1;

        res.status(200).json({
            result: controls,
            pagination: {
                currentPage: pageNumber,
                pageSize: pageSizeNumber,
                totalItems: totalControls,
                totalPages: totalPages,
                hasNextPage: hasNextPage,
                hasPrevPage: hasPrevPage,
                nextPage: hasNextPage ? pageNumber + 1 : null,
                prevPage: hasPrevPage ? pageNumber - 1 : null,
            },
        });
    } catch (error) {
        console.error(error);
        next({ status: 500, message: "Error interno al obtener los controles", details: error.message });
    } finally {
        await prisma.$disconnect();
    }
}

async function CheckIfTodayControlExists(type, userId) {
    const prisma = new PrismaClient();
    try {
        const today = new Date();
        const control = await prisma.control.findFirst({
            where: {
                AND: [
                    { userId: userId },
                    { typeControl: type },
                    {
                        createdAt: {
                            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()), // Desde el inicio del día
                            lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1), // Hasta el inicio del siguiente día
                        },
                    },
                ],
            }
        })

        if (control) {
            return true
        }
        return false
    } catch (error) {
        console.log(error);
        return false
    } finally {
        prisma.$disconnect();
    }
}

async function FindUserById(id) {
    if (!id) throw new Error("Error al obtener la id del usuario")
    const prisma = new PrismaClient()
    try {
        const user = await prisma.user.findFirst({
            where: { id: id }
        })
        if (!user) return false
        return true
    } catch (error) {
        return null
    } finally {
        prisma.$disconnect()
    }
}
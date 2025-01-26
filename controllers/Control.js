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

        // Agrupar los controles por mes
        const today = new Date(); // Fecha actual
        const currentYear = today.getFullYear(); // Año actual

        // Calculamos el offset y limit
        const skip = (pageNumber - 1) * pageSizeNumber;

        // Obtenemos total de usuarios
        const totalUsers = await prisma.user.count();

        // Definir rango de fechas para el año actual
        const startOfYear = new Date(currentYear, 0, 1); // 1 de enero del año actual
        const endOfYear = new Date(currentYear + 1, 0, 1); // 1 de enero del próximo año

        // Obtenemos los controles no paginados
        const fullControls = await prisma.control.findMany({
            where: {
                createdAt: {
                    gte: startOfYear, // Desde el inicio del año actual
                    lt: endOfYear,    // Hasta el inicio del próximo año
                },
            }
        });

        // Obtenemos los controles paginados
        const controls = await prisma.control.findMany({
            where: {
                createdAt: {
                    gte: startOfYear, // Desde el inicio del año actual
                    lt: endOfYear,    // Hasta el inicio del próximo año
                },
            },
            skip: skip,
            take: pageSizeNumber,
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
                createdAt: {
                    gte: startOfYear, // Desde el inicio del año actual
                    lt: endOfYear,    // Hasta el inicio del próximo año
                },
            }
        });

        // Lista de días festivos configurables (en formato 'YYYY-MM-DD')
        const holidays = [
            "2025-01-01", // Ejemplo: Año Nuevo
            //"2025-01-06", // Ejemplo: Día de Reyes
            // Agrega más fechas festivas aquí
        ];

        // Función para verificar si un día es hábil (ni sábado, ni domingo, ni festivo)
        const isBusinessDay = date => {
            const day = date.getDay();
            const formattedDate = date.toISOString().split("T")[0];
            return day !== 0 && day !== 6 && !holidays.includes(formattedDate); // Excluir domingos, sábados y festivos
        };

        const chartData = Array.from({ length: 12 }, (_, index) => {
            const month = index + 1; // Meses del 1 al 12

            // Determinar si es un mes futuro
            if (month > today.getMonth() + 1) {
                return {
                    month: new Date(0, month - 1).toLocaleString("default", { month: "long" }),
                    asistencias: 0,
                    inasistencias: 0,
                };
            }

            // Filtrar controles del mes específico
            const monthControls = fullControls.filter(control => {
                const controlDate = new Date(control.createdAt);
                const controlMonth = controlDate.getMonth() + 1;
                const controlYear = controlDate.getFullYear();

                // Incluir controles del mes y año actual, hasta el día actual si corresponde
                return (
                    controlMonth === month &&
                    controlYear === currentYear &&
                    (month < today.getMonth() + 1 || controlDate <= today)
                );
            });

            // Calcular asistencias para el mes
            const asistencias = monthControls.filter(control => control.typeControl === "ENTRADA").length;

            // Calcular días hábiles del mes hasta la fecha actual
            const daysInMonth = new Date(currentYear, month, 0).getDate();
            const validDays = Array.from({ length: daysInMonth }, (_, dayIndex) => {
                const date = new Date(currentYear, month - 1, dayIndex + 1);
                return isBusinessDay(date) && (month < today.getMonth() + 1 || date <= today);
            }).filter(Boolean).length;

            // Calcular inasistencias considerando usuarios y días hábiles válidos
            const totalExpectedAttendances = totalUsers * validDays;
            const inasistencias = totalExpectedAttendances - asistencias;

            return {
                month: new Date(0, month - 1).toLocaleString("default", { month: "long" }),
                asistencias,
                inasistencias,
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
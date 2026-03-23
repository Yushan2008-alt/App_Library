import { prisma } from '@/lib/prisma'

export async function createNotification(userId: string, message: string) {
  return prisma.notification.create({
    data: { userId, message },
  })
}

export async function createNotificationsForAdmins(message: string) {
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
  if (admins.length === 0) return
  await prisma.notification.createMany({
    data: admins.map((admin) => ({ userId: admin.id, message })),
  })
}

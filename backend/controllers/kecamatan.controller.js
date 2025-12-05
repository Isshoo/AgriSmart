import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllKecamatan = async (req, res) => {
  try {
    const kecamatan = await prisma.kecamatan.findMany({
      orderBy: { nama: 'asc' }
    });

    res.json(kecamatan);
  } catch (error) {
    console.error('Get all kecamatan error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const createKecamatan = async (req, res) => {
  try {
    const { nama } = req.body;

    if (!nama) {
      return res.status(400).json({ message: 'Nama kecamatan harus diisi' });
    }

    const kecamatan = await prisma.kecamatan.create({
      data: { nama }
    });

    res.status(201).json({ message: 'Kecamatan berhasil ditambahkan', data: kecamatan });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Kecamatan sudah terdaftar' });
    }
    console.error('Create kecamatan error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};


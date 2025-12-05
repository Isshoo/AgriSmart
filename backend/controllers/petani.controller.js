import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllPetani = async (req, res) => {
  try {
    const { search, kecamatan, komoditas, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { nik: { contains: search, mode: 'insensitive' } },
        { alamat: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (kecamatan) {
      where.kecamatanId = kecamatan;
    }

    if (komoditas) {
      where.jenisTanaman = { contains: komoditas, mode: 'insensitive' };
    }

    const [petani, total] = await Promise.all([
      prisma.petani.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          kecamatan: {
            select: { id: true, nama: true }
          },
          kelompokTani: {
            select: { id: true, nama: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.petani.count({ where })
    ]);

    res.json({
      data: petani,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all petani error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const getPetaniById = async (req, res) => {
  try {
    const { id } = req.params;

    const petani = await prisma.petani.findUnique({
      where: { id },
      include: {
        kecamatan: true,
        kelompokTani: true
      }
    });

    if (!petani) {
      return res.status(404).json({ message: 'Data petani tidak ditemukan' });
    }

    res.json(petani);
  } catch (error) {
    console.error('Get petani by id error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const createPetani = async (req, res) => {
  try {
    const { nama, nik, alamat, kontak, luasLahan, jenisTanaman, kecamatanId, kelompokTaniId } = req.body;

    if (!nama || !nik || !alamat || !luasLahan || !jenisTanaman || !kecamatanId) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    // Check if NIK already exists
    const existingPetani = await prisma.petani.findUnique({
      where: { nik }
    });

    if (existingPetani) {
      return res.status(400).json({ message: 'NIK sudah terdaftar' });
    }

    const petani = await prisma.petani.create({
      data: {
        nama,
        nik,
        alamat,
        kontak,
        luasLahan: parseFloat(luasLahan),
        jenisTanaman,
        kecamatanId,
        kelompokTaniId: kelompokTaniId || null
      },
      include: {
        kecamatan: true,
        kelompokTani: true
      }
    });

    res.status(201).json({ message: 'Data petani berhasil ditambahkan', data: petani });
  } catch (error) {
    console.error('Create petani error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const updatePetani = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nik, alamat, kontak, luasLahan, jenisTanaman, kecamatanId, kelompokTaniId } = req.body;

    const existingPetani = await prisma.petani.findUnique({
      where: { id }
    });

    if (!existingPetani) {
      return res.status(404).json({ message: 'Data petani tidak ditemukan' });
    }

    // Check if NIK is being changed and already exists
    if (nik && nik !== existingPetani.nik) {
      const nikExists = await prisma.petani.findUnique({
        where: { nik }
      });

      if (nikExists) {
        return res.status(400).json({ message: 'NIK sudah terdaftar' });
      }
    }

    const petani = await prisma.petani.update({
      where: { id },
      data: {
        ...(nama && { nama }),
        ...(nik && { nik }),
        ...(alamat && { alamat }),
        ...(kontak !== undefined && { kontak }),
        ...(luasLahan && { luasLahan: parseFloat(luasLahan) }),
        ...(jenisTanaman && { jenisTanaman }),
        ...(kecamatanId && { kecamatanId }),
        ...(kelompokTaniId !== undefined && { kelompokTaniId: kelompokTaniId || null })
      },
      include: {
        kecamatan: true,
        kelompokTani: true
      }
    });

    res.json({ message: 'Data petani berhasil diupdate', data: petani });
  } catch (error) {
    console.error('Update petani error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const deletePetani = async (req, res) => {
  try {
    const { id } = req.params;

    const petani = await prisma.petani.findUnique({
      where: { id }
    });

    if (!petani) {
      return res.status(404).json({ message: 'Data petani tidak ditemukan' });
    }

    await prisma.petani.delete({
      where: { id }
    });

    res.json({ message: 'Data petani berhasil dihapus' });
  } catch (error) {
    console.error('Delete petani error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllKelompokTani = async (req, res) => {
  try {
    const { search, kecamatan, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { ketua: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (kecamatan) {
      where.kecamatanId = kecamatan;
    }

    const [kelompokTani, total] = await Promise.all([
      prisma.kelompokTani.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          kecamatan: {
            select: { id: true, nama: true }
          },
          _count: {
            select: { petani: true, komoditas: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.kelompokTani.count({ where })
    ]);

    // Calculate jumlah anggota from petani count
    const data = kelompokTani.map(kelompok => ({
      ...kelompok,
      jumlahAnggota: kelompok._count.petani
    }));

    res.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all kelompok tani error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const getKelompokTaniById = async (req, res) => {
  try {
    const { id } = req.params;

    const kelompokTani = await prisma.kelompokTani.findUnique({
      where: { id },
      include: {
        kecamatan: true,
        petani: {
          include: {
            kecamatan: {
              select: { id: true, nama: true }
            }
          }
        },
        komoditas: true
      }
    });

    if (!kelompokTani) {
      return res.status(404).json({ message: 'Data kelompok tani tidak ditemukan' });
    }

    // Calculate jumlah anggota
    const jumlahAnggota = kelompokTani.petani.length;
    const luasLahanTotal = kelompokTani.petani.reduce((sum, petani) => sum + petani.luasLahan, 0);

    res.json({
      ...kelompokTani,
      jumlahAnggota,
      luasLahanTotal
    });
  } catch (error) {
    console.error('Get kelompok tani by id error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const createKelompokTani = async (req, res) => {
  try {
    const { nama, ketua, kecamatanId, alamat, kontak } = req.body;

    if (!nama || !ketua || !kecamatanId) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    const kelompokTani = await prisma.kelompokTani.create({
      data: {
        nama,
        ketua,
        kecamatanId,
        alamat,
        kontak,
        jumlahAnggota: 0,
        luasLahanTotal: 0
      },
      include: {
        kecamatan: true
      }
    });

    res.status(201).json({ message: 'Data kelompok tani berhasil ditambahkan', data: kelompokTani });
  } catch (error) {
    console.error('Create kelompok tani error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const updateKelompokTani = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, ketua, kecamatanId, alamat, kontak } = req.body;

    const existingKelompok = await prisma.kelompokTani.findUnique({
      where: { id }
    });

    if (!existingKelompok) {
      return res.status(404).json({ message: 'Data kelompok tani tidak ditemukan' });
    }

    // Recalculate jumlahAnggota and luasLahanTotal
    const petani = await prisma.petani.findMany({
      where: { kelompokTaniId: id }
    });

    const jumlahAnggota = petani.length;
    const luasLahanTotal = petani.reduce((sum, p) => sum + p.luasLahan, 0);

    const kelompokTani = await prisma.kelompokTani.update({
      where: { id },
      data: {
        ...(nama && { nama }),
        ...(ketua && { ketua }),
        ...(kecamatanId && { kecamatanId }),
        ...(alamat !== undefined && { alamat }),
        ...(kontak !== undefined && { kontak }),
        jumlahAnggota,
        luasLahanTotal
      },
      include: {
        kecamatan: true
      }
    });

    res.json({ message: 'Data kelompok tani berhasil diupdate', data: kelompokTani });
  } catch (error) {
    console.error('Update kelompok tani error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const deleteKelompokTani = async (req, res) => {
  try {
    const { id } = req.params;

    const kelompokTani = await prisma.kelompokTani.findUnique({
      where: { id }
    });

    if (!kelompokTani) {
      return res.status(404).json({ message: 'Data kelompok tani tidak ditemukan' });
    }

    // Remove kelompokTaniId from all petani
    await prisma.petani.updateMany({
      where: { kelompokTaniId: id },
      data: { kelompokTaniId: null }
    });

    await prisma.kelompokTani.delete({
      where: { id }
    });

    res.json({ message: 'Data kelompok tani berhasil dihapus' });
  } catch (error) {
    console.error('Delete kelompok tani error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};


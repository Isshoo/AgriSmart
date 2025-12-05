import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllKomoditas = async (req, res) => {
  try {
    const { search, jenis, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { jenis: { contains: search, mode: 'insensitive' } },
        { jenisPupuk: { contains: search, mode: 'insensitive' } },
        { pestisida: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (jenis) {
      where.jenis = { contains: jenis, mode: 'insensitive' };
    }

    const [komoditas, total] = await Promise.all([
      prisma.komoditas.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          kelompokTani: {
            select: { id: true, nama: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.komoditas.count({ where })
    ]);

    res.json({
      data: komoditas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all komoditas error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const getKomoditasById = async (req, res) => {
  try {
    const { id } = req.params;

    const komoditas = await prisma.komoditas.findUnique({
      where: { id },
      include: {
        kelompokTani: true
      }
    });

    if (!komoditas) {
      return res.status(404).json({ message: 'Data komoditas tidak ditemukan' });
    }

    res.json(komoditas);
  } catch (error) {
    console.error('Get komoditas by id error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const createKomoditas = async (req, res) => {
  try {
    const { jenis, luasTanam, estimasiPanen, jenisPupuk, pestisida, kelompokTaniId } = req.body;

    if (!jenis || !luasTanam) {
      return res.status(400).json({ message: 'Jenis dan luas tanam harus diisi' });
    }

    const komoditas = await prisma.komoditas.create({
      data: {
        jenis,
        luasTanam: parseFloat(luasTanam),
        estimasiPanen: estimasiPanen ? parseFloat(estimasiPanen) : null,
        jenisPupuk,
        pestisida,
        kelompokTaniId: kelompokTaniId || null
      },
      include: {
        kelompokTani: true
      }
    });

    res.status(201).json({ message: 'Data komoditas berhasil ditambahkan', data: komoditas });
  } catch (error) {
    console.error('Create komoditas error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const updateKomoditas = async (req, res) => {
  try {
    const { id } = req.params;
    const { jenis, luasTanam, estimasiPanen, jenisPupuk, pestisida, kelompokTaniId } = req.body;

    const existingKomoditas = await prisma.komoditas.findUnique({
      where: { id }
    });

    if (!existingKomoditas) {
      return res.status(404).json({ message: 'Data komoditas tidak ditemukan' });
    }

    const komoditas = await prisma.komoditas.update({
      where: { id },
      data: {
        ...(jenis && { jenis }),
        ...(luasTanam && { luasTanam: parseFloat(luasTanam) }),
        ...(estimasiPanen !== undefined && { estimasiPanen: estimasiPanen ? parseFloat(estimasiPanen) : null }),
        ...(jenisPupuk !== undefined && { jenisPupuk }),
        ...(pestisida !== undefined && { pestisida }),
        ...(kelompokTaniId !== undefined && { kelompokTaniId: kelompokTaniId || null })
      },
      include: {
        kelompokTani: true
      }
    });

    res.json({ message: 'Data komoditas berhasil diupdate', data: komoditas });
  } catch (error) {
    console.error('Update komoditas error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const deleteKomoditas = async (req, res) => {
  try {
    const { id } = req.params;

    const komoditas = await prisma.komoditas.findUnique({
      where: { id }
    });

    if (!komoditas) {
      return res.status(404).json({ message: 'Data komoditas tidak ditemukan' });
    }

    await prisma.komoditas.delete({
      where: { id }
    });

    res.json({ message: 'Data komoditas berhasil dihapus' });
  } catch (error) {
    console.error('Delete komoditas error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};


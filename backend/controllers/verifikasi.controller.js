import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPendingKelompokTani = async (req, res) => {
  try {
    const { search, kecamatan, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      verificationStatus: 'PENDING'
    };

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
    console.error('Get pending kelompok tani error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const verifyKelompokTani = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body;

    if (!['DITERIMA', 'DITOLAK'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const kelompokTani = await prisma.kelompokTani.findUnique({
      where: { id }
    });

    if (!kelompokTani) {
      return res.status(404).json({ message: 'Data kelompok tani tidak ditemukan' });
    }

    const updated = await prisma.kelompokTani.update({
      where: { id },
      data: {
        verificationStatus: status,
        verifiedBy: req.user.id,
        verifiedAt: new Date(),
        catatan: catatan || null
      },
      include: {
        kecamatan: true
      }
    });

    res.json({
      message: `Data berhasil ${status === 'DITERIMA' ? 'diverifikasi' : 'ditolak'}`,
      data: updated
    });
  } catch (error) {
    console.error('Verify kelompok tani error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const getKelompokTaniStats = async (req, res) => {
  try {
    const stats = await prisma.kelompokTani.groupBy({
      by: ['verificationStatus'],
      _count: {
        id: true
      }
    });

    const result = {
      PENDING: 0,
      DITERIMA: 0,
      DITOLAK: 0
    };

    stats.forEach(stat => {
      result[stat.verificationStatus] = stat._count.id;
    });

    res.json(result);
  } catch (error) {
    console.error('Get kelompok tani stats error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};


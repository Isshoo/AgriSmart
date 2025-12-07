import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';

const prisma = new PrismaClient();

export const getDashboardStats = async (req, res) => {
  try {
    const [totalPetani, totalKelompokTani, totalKecamatan, totalKomoditas] = await Promise.all([
      prisma.petani.count(),
      prisma.kelompokTani.count({
        where: {
          verificationStatus: 'DITERIMA'
        }
      }),
      prisma.kecamatan.count(),
      prisma.komoditas.count()
    ]);

    // Calculate total luas lahan
    const petaniData = await prisma.petani.findMany({
      select: { luasLahan: true }
    });
    const luasLahanTotal = petaniData.reduce((sum, p) => sum + p.luasLahan, 0);

    // Get komoditas distribution (hanya dari kelompok tani yang sudah diverifikasi)
    const kelompokTaniVerified = await prisma.kelompokTani.findMany({
      where: {
        verificationStatus: 'DITERIMA'
      },
      select: { id: true }
    });
    const kelompokTaniIds = kelompokTaniVerified.map(kt => kt.id);

    const komoditasData = await prisma.komoditas.findMany({
      where: {
        kelompokTaniId: {
          in: kelompokTaniIds
        }
      },
      select: { jenis: true, luasTanam: true }
    });

    const komoditasDistribution = komoditasData.reduce((acc, k) => {
      acc[k.jenis] = (acc[k.jenis] || 0) + k.luasTanam;
      return acc;
    }, {});

    // Get kelompok tani per kecamatan (hanya yang sudah diverifikasi)
    const kelompokTaniData = await prisma.kelompokTani.findMany({
      where: {
        verificationStatus: 'DITERIMA'
      },
      include: {
        kecamatan: {
          select: { nama: true }
        }
      }
    });

    const kelompokPerKecamatan = kelompokTaniData.reduce((acc, kt) => {
      const kecamatan = kt.kecamatan.nama;
      acc[kecamatan] = (acc[kecamatan] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalPetani,
      totalKelompokTani,
      totalKecamatan,
      totalKomoditas,
      luasLahanTotal,
      komoditasDistribution,
      kelompokPerKecamatan
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const getLaporanPetani = async (req, res) => {
  try {
    const petani = await prisma.petani.findMany({
      include: {
        kecamatan: true,
        kelompokTani: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(petani);
  } catch (error) {
    console.error('Get laporan petani error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const getLaporanKelompokTani = async (req, res) => {
  try {
    const kelompokTani = await prisma.kelompokTani.findMany({
      where: {
        verificationStatus: 'DITERIMA'
      },
      include: {
        kecamatan: true,
        petani: {
          select: {
            id: true,
            nama: true,
            luasLahan: true,
            jenisTanaman: true
          }
        },
        komoditas: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const data = kelompokTani.map(kt => ({
      ...kt,
      jumlahAnggota: kt.petani.length,
      luasLahanTotal: kt.petani.reduce((sum, p) => sum + p.luasLahan, 0)
    }));

    res.json(data);
  } catch (error) {
    console.error('Get laporan kelompok tani error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const getLaporanKomoditas = async (req, res) => {
  try {
    const komoditas = await prisma.komoditas.findMany({
      include: {
        kelompokTani: {
          include: {
            kecamatan: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(komoditas);
  } catch (error) {
    console.error('Get laporan komoditas error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const exportExcel = async (req, res) => {
  try {
    const { type } = req.query;

    let data = [];
    let filename = '';

    if (type === 'petani') {
      const petani = await prisma.petani.findMany({
        include: {
          kecamatan: true,
          kelompokTani: true
        }
      });

      data = petani.map(p => ({
        'Nama': p.nama,
        'NIK': p.nik,
        'Alamat': p.alamat,
        'Kontak': p.kontak || '-',
        'Luas Lahan (Ha)': p.luasLahan,
        'Jenis Tanaman': p.jenisTanaman,
        'Kecamatan': p.kecamatan.nama,
        'Kelompok Tani': p.kelompokTani?.nama || '-'
      }));

      filename = 'laporan_petani.xlsx';
    } else if (type === 'kelompok-tani') {
      const kelompokTani = await prisma.kelompokTani.findMany({
        include: {
          kecamatan: true,
          petani: true,
          komoditas: true
        }
      });

      data = kelompokTani.map(kt => ({
        'Nama Kelompok': kt.nama,
        'Ketua': kt.ketua,
        'Jumlah Anggota': kt.petani.length,
        'Kecamatan': kt.kecamatan.nama,
        'Luas Lahan Total (Ha)': kt.petani.reduce((sum, p) => sum + p.luasLahan, 0),
        'Alamat': kt.alamat || '-',
        'Kontak': kt.kontak || '-',
        'Komoditas': kt.komoditas.map(k => k.jenis).join(', ') || '-'
      }));

      filename = 'laporan_kelompok_tani.xlsx';
    } else if (type === 'komoditas') {
      const kelompokTaniVerified = await prisma.kelompokTani.findMany({
        where: {
          verificationStatus: 'DITERIMA'
        },
        select: { id: true }
      });
      const kelompokTaniIds = kelompokTaniVerified.map(kt => kt.id);

      const komoditas = await prisma.komoditas.findMany({
        where: {
          kelompokTaniId: {
            in: kelompokTaniIds
          }
        },
        include: {
          kelompokTani: true
        }
      });

      data = komoditas.map(k => ({
        'Jenis Komoditas': k.jenis,
        'Luas Tanam (Ha)': k.luasTanam,
        'Estimasi Panen (Ton)': k.estimasiPanen || '-',
        'Jenis Pupuk': k.jenisPupuk || '-',
        'Pestisida': k.pestisida || '-',
        'Kelompok Tani': k.kelompokTani?.nama || '-'
      }));

      filename = 'laporan_komoditas.xlsx';
    } else {
      return res.status(400).json({ message: 'Type tidak valid' });
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Export Excel error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const exportPDF = async (req, res) => {
  try {
    // For PDF export, we'll return JSON data that frontend can use with a PDF library
    // You can implement PDF generation on backend using libraries like pdfkit or puppeteer
    const { type } = req.query;

    let data = {};

    if (type === 'petani') {
      const petani = await prisma.petani.findMany({
        include: {
          kecamatan: true,
          kelompokTani: true
        }
      });
      data = { type: 'petani', data: petani };
    } else if (type === 'kelompok-tani') {
      const kelompokTani = await prisma.kelompokTani.findMany({
        where: {
          verificationStatus: 'DITERIMA'
        },
        include: {
          kecamatan: true,
          petani: true,
          komoditas: true
        }
      });
      data = { type: 'kelompok-tani', data: kelompokTani };
    } else if (type === 'komoditas') {
      const kelompokTaniVerified = await prisma.kelompokTani.findMany({
        where: {
          verificationStatus: 'DITERIMA'
        },
        select: { id: true }
      });
      const kelompokTaniIds = kelompokTaniVerified.map(kt => kt.id);

      const komoditas = await prisma.komoditas.findMany({
        where: {
          kelompokTaniId: {
            in: kelompokTaniIds
          }
        },
        include: {
          kelompokTani: true
        }
      });
      data = { type: 'komoditas', data: komoditas };
    } else {
      return res.status(400).json({ message: 'Type tidak valid' });
    }

    // Return JSON data for frontend to generate PDF
    res.json(data);
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};


import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data (optional - uncomment if you want to reset)
  // await prisma.komoditas.deleteMany();
  // await prisma.petani.deleteMany();
  // await prisma.kelompokTani.deleteMany();
  // await prisma.kecamatan.deleteMany();
  // await prisma.user.deleteMany();

  // ==================== USERS ====================
  console.log('📝 Creating users...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const penyuluhPassword = await bcrypt.hash('penyuluh123', 10);
  const kepalaBidangPassword = await bcrypt.hash('kepalabidang123', 10);
  const kepalaDinasPassword = await bcrypt.hash('kepaladinas123', 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        nama: 'Dr. Ahmad Hidayat, S.P., M.Si',
        username: 'admin',
        password: adminPassword,
        role: 'ADMIN'
      }
    }),
    prisma.user.upsert({
      where: { username: 'penyuluh' },
      update: {},
      create: {
        nama: 'Budi Santoso, S.P.',
        username: 'penyuluh',
        password: penyuluhPassword,
        role: 'PENYULUH'
      }
    }),
    prisma.user.upsert({
      where: { username: 'penyuluh2' },
      update: {},
      create: {
        nama: 'Siti Nurhaliza, S.P.',
        username: 'penyuluh2',
        password: penyuluhPassword,
        role: 'PENYULUH'
      }
    }),
    prisma.user.upsert({
      where: { username: 'penyuluh3' },
      update: {},
      create: {
        nama: 'Rudi Hartono, S.P.',
        username: 'penyuluh3',
        password: penyuluhPassword,
        role: 'PENYULUH'
      }
    }),
    prisma.user.upsert({
      where: { username: 'kepalabidang' },
      update: {},
      create: {
        nama: 'Ir. Muhammad Faisal, M.M.',
        username: 'kepalabidang',
        password: kepalaBidangPassword,
        role: 'KEPALA_BIDANG'
      }
    }),
    prisma.user.upsert({
      where: { username: 'kepaladinas' },
      update: {},
      create: {
        nama: 'Dr. Ir. H. Abdul Rahman, M.P.',
        username: 'kepaladinas',
        password: kepalaDinasPassword,
        role: 'KEPALA_DINAS'
      }
    })
  ]);

  console.log(`✅ Created ${users.length} users\n`);

  // ==================== KECAMATAN ====================
  console.log('🏘️  Creating kecamatan...');
  const kecamatanNames = [
    'Malalayang',
    'Wenang',
    'Tuminting',
    'Mapanget',
    'Sario',
    'Tikala',
    'Paal Dua',
    'Wanea',
    'Singkil',
    'Bunaken',
    'Bunaken Kepulauan'
  ];

  const kecamatan = await Promise.all(
    kecamatanNames.map((nama) =>
      prisma.kecamatan.upsert({
        where: { nama },
        update: {},
        create: { nama }
      })
    )
  );

  console.log(`✅ Created ${kecamatan.length} kecamatan\n`);

  // ==================== KELOMPOK TANI ====================
  console.log('👥 Creating kelompok tani...');
  const kelompokTaniData = [
    { nama: 'Kelompok Tani Makmur Jaya', ketua: 'Ahmad Yani', kecamatan: 'Malalayang', alamat: 'Jl. Raya Malalayang No. 45', kontak: '081234567890' },
    { nama: 'Kelompok Tani Sejahtera', ketua: 'Bambang Sutrisno', kecamatan: 'Malalayang', alamat: 'Jl. Perkebunan Malalayang', kontak: '081234567891' },
    { nama: 'Kelompok Tani Harapan Baru', ketua: 'Siti Aisyah', kecamatan: 'Wenang', alamat: 'Jl. Sam Ratulangi No. 123', kontak: '081234567892' },
    { nama: 'Kelompok Tani Bersama', ketua: 'Muhammad Rizki', kecamatan: 'Wenang', alamat: 'Jl. Sudirman Wenang', kontak: '081234567893' },
    { nama: 'Kelompok Tani Mandiri', ketua: 'Dewi Sartika', kecamatan: 'Tuminting', alamat: 'Jl. Piere Tendean Tuminting', kontak: '081234567894' },
    { nama: 'Kelompok Tani Lestari', ketua: 'Joko Widodo', kecamatan: 'Tuminting', alamat: 'Jl. Boulevard Tuminting', kontak: '081234567895' },
    { nama: 'Kelompok Tani Makmur Sejahtera', ketua: 'Ratna Sari', kecamatan: 'Mapanget', alamat: 'Jl. Raya Mapanget Km 5', kontak: '081234567896' },
    { nama: 'Kelompok Tani Subur Makmur', ketua: 'Andi Pratama', kecamatan: 'Mapanget', alamat: 'Jl. Trans Sulawesi Mapanget', kontak: '081234567897' },
    { nama: 'Kelompok Tani Jaya Abadi', ketua: 'Lina Marlina', kecamatan: 'Sario', alamat: 'Jl. Sario Raya No. 78', kontak: '081234567898' },
    { nama: 'Kelompok Tani Maju Terus', ketua: 'Hendra Gunawan', kecamatan: 'Sario', alamat: 'Jl. Perumahan Sario Indah', kontak: '081234567899' },
    { nama: 'Kelompok Tani Berkah', ketua: 'Suryadi', kecamatan: 'Tikala', alamat: 'Jl. Tikala Baru No. 12', kontak: '081234567900' },
    { nama: 'Kelompok Tani Makmur Abadi', ketua: 'Nurhayati', kecamatan: 'Tikala', alamat: 'Jl. Raya Tikala', kontak: '081234567901' },
    { nama: 'Kelompok Tani Sejahtera Bersama', ketua: 'Ahmad Fauzi', kecamatan: 'Paal Dua', alamat: 'Jl. Paal Dua Raya', kontak: '081234567902' },
    { nama: 'Kelompok Tani Harmonis', ketua: 'Siti Fatimah', kecamatan: 'Paal Dua', alamat: 'Jl. Perkebunan Paal Dua', kontak: '081234567903' },
    { nama: 'Kelompok Tani Makmur Sentosa', ketua: 'Budi Raharjo', kecamatan: 'Wanea', alamat: 'Jl. Wanea Raya No. 56', kontak: '081234567904' },
    { nama: 'Kelompok Tani Lestari Jaya', ketua: 'Rina Wati', kecamatan: 'Wanea', alamat: 'Jl. Perumahan Wanea Indah', kontak: '081234567905' },
    { nama: 'Kelompok Tani Subur Makmur', ketua: 'Agus Salim', kecamatan: 'Singkil', alamat: 'Jl. Singkil Raya', kontak: '081234567906' },
    { nama: 'Kelompok Tani Mandiri Sejahtera', ketua: 'Yuni Astuti', kecamatan: 'Singkil', alamat: 'Jl. Perkebunan Singkil', kontak: '081234567907' },
    { nama: 'Kelompok Tani Berkah Jaya', ketua: 'Rudi Hermawan', kecamatan: 'Bunaken', alamat: 'Jl. Pantai Bunaken', kontak: '081234567908' },
    { nama: 'Kelompok Tani Makmur Lestari', ketua: 'Sari Dewi', kecamatan: 'Bunaken', alamat: 'Jl. Bunaken Raya', kontak: '081234567909' },
    { nama: 'Kelompok Tani Sejahtera Abadi', ketua: 'Ahmad Dahlan', kecamatan: 'Bunaken Kepulauan', alamat: 'Pulau Bunaken', kontak: '081234567910' },
    { nama: 'Kelompok Tani Harmonis Jaya', ketua: 'Maya Sari', kecamatan: 'Bunaken Kepulauan', alamat: 'Pulau Siladen', kontak: '081234567911' },
    { nama: 'Kelompok Tani Maju Bersama', ketua: 'Dedi Kurniawan', kecamatan: 'Malalayang', alamat: 'Jl. Raya Malalayang No. 100', kontak: '081234567912' },
    { nama: 'Kelompok Tani Subur Jaya', ketua: 'Indah Permata', kecamatan: 'Wenang', alamat: 'Jl. Wenang Raya', kontak: '081234567913' },
    { nama: 'Kelompok Tani Makmur Sentosa', ketua: 'Feri Gunawan', kecamatan: 'Tuminting', alamat: 'Jl. Tuminting Baru', kontak: '081234567914' }
  ];

  const kelompokTani = await Promise.all(
    kelompokTaniData.map((data) => {
      const kecamatanObj = kecamatan.find((k) => k.nama === data.kecamatan);
      return prisma.kelompokTani.create({
        data: {
          nama: data.nama,
          ketua: data.ketua,
          kecamatanId: kecamatanObj.id,
          alamat: data.alamat,
          kontak: data.kontak,
          jumlahAnggota: 0,
          luasLahanTotal: 0
        }
      });
    })
  );

  console.log(`✅ Created ${kelompokTani.length} kelompok tani\n`);

  // ==================== PETANI ====================
  console.log('👨‍🌾 Creating petani...');
  const petaniData = [];
  const namaDepan = ['Ahmad', 'Budi', 'Siti', 'Muhammad', 'Dewi', 'Joko', 'Ratna', 'Andi', 'Lina', 'Hendra', 'Suryadi', 'Nurhayati', 'Fauzi', 'Fatimah', 'Raharjo', 'Wati', 'Salim', 'Astuti', 'Hermawan', 'Dewi', 'Dahlan', 'Sari', 'Kurniawan', 'Permata', 'Gunawan', 'Yani', 'Sutrisno', 'Aisyah', 'Rizki', 'Sartika', 'Widodo', 'Pratama', 'Marlina', 'Gunawan', 'Suryadi', 'Fauzi', 'Raharjo', 'Salim', 'Hermawan', 'Kurniawan'];
  const namaBelakang = ['Yani', 'Santoso', 'Nurhaliza', 'Rizki', 'Sartika', 'Widodo', 'Sari', 'Pratama', 'Marlina', 'Gunawan', 'Sutrisno', 'Aisyah', 'Fauzi', 'Fatimah', 'Raharjo', 'Wati', 'Salim', 'Astuti', 'Hermawan', 'Dewi', 'Dahlan', 'Sari', 'Kurniawan', 'Permata', 'Gunawan', 'Hartono', 'Sutrisno', 'Nurhaliza', 'Rizki', 'Sartika', 'Widodo', 'Pratama', 'Marlina', 'Gunawan', 'Sutrisno', 'Fauzi', 'Raharjo', 'Salim', 'Hermawan', 'Kurniawan'];
  const jenisTanaman = ['Padi', 'Jagung', 'Cabai', 'Tomat', 'Bawang Merah', 'Bawang Putih', 'Kacang Tanah', 'Kedelai', 'Ubi Jalar', 'Singkong', 'Pisang', 'Nanas', 'Mangga', 'Jeruk', 'Sayuran', 'Hortikultura'];

  // Generate 150 petani
  for (let i = 0; i < 150; i++) {
    const namaDepanIdx = Math.floor(Math.random() * namaDepan.length);
    const namaBelakangIdx = Math.floor(Math.random() * namaBelakang.length);
    const nama = `${namaDepan[namaDepanIdx]} ${namaBelakang[namaBelakangIdx]}`;
    const nik = `717103${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    const kecamatanIdx = Math.floor(Math.random() * kecamatan.length);
    const kelompokTaniIdx = Math.random() > 0.3 ? Math.floor(Math.random() * kelompokTani.length) : null; // 70% punya kelompok tani
    const jenisTanamanIdx = Math.floor(Math.random() * jenisTanaman.length);
    const luasLahan = parseFloat((Math.random() * 5 + 0.5).toFixed(2)); // 0.5 - 5.5 Ha

    petaniData.push({
      nama,
      nik,
      alamat: `Jl. ${nama.split(' ')[0]} No. ${Math.floor(Math.random() * 200) + 1}, ${kecamatan[kecamatanIdx].nama}`,
      kontak: `0812${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      luasLahan,
      jenisTanaman: jenisTanaman[jenisTanamanIdx],
      kecamatanId: kecamatan[kecamatanIdx].id,
      kelompokTaniId: kelompokTaniIdx !== null ? kelompokTani[kelompokTaniIdx].id : null
    });
  }

  // Create petani in batches
  const batchSize = 50;
  for (let i = 0; i < petaniData.length; i += batchSize) {
    const batch = petaniData.slice(i, i + batchSize);
    await prisma.petani.createMany({
      data: batch,
      skipDuplicates: true
    });
  }

  // Update jumlahAnggota and luasLahanTotal for kelompok tani
  for (const kt of kelompokTani) {
    const petaniInKelompok = await prisma.petani.findMany({
      where: { kelompokTaniId: kt.id }
    });
    const jumlahAnggota = petaniInKelompok.length;
    const luasLahanTotal = petaniInKelompok.reduce((sum, p) => sum + p.luasLahan, 0);

    await prisma.kelompokTani.update({
      where: { id: kt.id },
      data: { jumlahAnggota, luasLahanTotal }
    });
  }

  const totalPetani = await prisma.petani.count();
  console.log(`✅ Created ${totalPetani} petani\n`);

  // ==================== KOMODITAS ====================
  console.log('🌾 Creating komoditas...');
  const komoditasTypes = [
    { jenis: 'Padi', pupuk: 'Urea, NPK', pestisida: 'Herbisida, Insektisida' },
    { jenis: 'Jagung', pupuk: 'Urea, SP-36', pestisida: 'Insektisida' },
    { jenis: 'Cabai', pupuk: 'NPK, KCL', pestisida: 'Fungisida, Insektisida' },
    { jenis: 'Tomat', pupuk: 'NPK, Pupuk Organik', pestisida: 'Fungisida' },
    { jenis: 'Bawang Merah', pupuk: 'Urea, KCL', pestisida: 'Fungisida, Insektisida' },
    { jenis: 'Bawang Putih', pupuk: 'Urea, SP-36', pestisida: 'Fungisida' },
    { jenis: 'Kacang Tanah', pupuk: 'Urea, SP-36', pestisida: 'Insektisida' },
    { jenis: 'Kedelai', pupuk: 'Urea, SP-36', pestisida: 'Herbisida' },
    { jenis: 'Ubi Jalar', pupuk: 'Pupuk Organik, Urea', pestisida: 'Insektisida' },
    { jenis: 'Singkong', pupuk: 'Urea, KCL', pestisida: 'Herbisida' },
    { jenis: 'Pisang', pupuk: 'NPK, Pupuk Organik', pestisida: 'Fungisida' },
    { jenis: 'Nanas', pupuk: 'NPK, KCL', pestisida: 'Fungisida, Insektisida' },
    { jenis: 'Mangga', pupuk: 'NPK, Pupuk Organik', pestisida: 'Fungisida' },
    { jenis: 'Jeruk', pupuk: 'NPK, KCL', pestisida: 'Fungisida, Insektisida' },
    { jenis: 'Sayuran Daun', pupuk: 'Pupuk Organik, Urea', pestisida: 'Insektisida' },
    { jenis: 'Sayuran Buah', pupuk: 'NPK, Pupuk Organik', pestisida: 'Fungisida' },
    { jenis: 'Hortikultura', pupuk: 'NPK, Pupuk Organik', pestisida: 'Fungisida, Insektisida' }
  ];

  const komoditasData = [];
  const allKelompokTani = await prisma.kelompokTani.findMany();

  // Create 50 komoditas entries
  for (let i = 0; i < 50; i++) {
    const komoditasType = komoditasTypes[Math.floor(Math.random() * komoditasTypes.length)];
    const luasTanam = parseFloat((Math.random() * 10 + 1).toFixed(2)); // 1 - 11 Ha
    const estimasiPanen = parseFloat((luasTanam * (Math.random() * 5 + 2)).toFixed(2)); // Estimasi 2-7 ton per Ha
    const kelompokTaniIdx = Math.random() > 0.4 ? Math.floor(Math.random() * allKelompokTani.length) : null; // 60% punya kelompok tani

    komoditasData.push({
      jenis: komoditasType.jenis,
      luasTanam,
      estimasiPanen,
      jenisPupuk: komoditasType.pupuk,
      pestisida: komoditasType.pestisida,
      kelompokTaniId: kelompokTaniIdx !== null ? allKelompokTani[kelompokTaniIdx].id : null
    });
  }

  await prisma.komoditas.createMany({
    data: komoditasData,
    skipDuplicates: true
  });

  const totalKomoditas = await prisma.komoditas.count();
  console.log(`✅ Created ${totalKomoditas} komoditas\n`);

  // ==================== SUMMARY ====================
  console.log('📊 Database Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const stats = {
    users: await prisma.user.count(),
    kecamatan: await prisma.kecamatan.count(),
    kelompokTani: await prisma.kelompokTani.count(),
    petani: await prisma.petani.count(),
    komoditas: await prisma.komoditas.count()
  };

  console.log(`👤 Users: ${stats.users}`);
  console.log(`🏘️  Kecamatan: ${stats.kecamatan}`);
  console.log(`👥 Kelompok Tani: ${stats.kelompokTani}`);
  console.log(`👨‍🌾 Petani: ${stats.petani}`);
  console.log(`🌾 Komoditas: ${stats.komoditas}`);

  const totalLuasLahan = await prisma.petani.aggregate({
    _sum: { luasLahan: true }
  });
  console.log(`📐 Total Luas Lahan: ${totalLuasLahan._sum.luasLahan?.toFixed(2)} Ha`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🔑 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin: admin / admin123');
  console.log('Penyuluh: penyuluh / penyuluh123');
  console.log('Penyuluh 2: penyuluh2 / penyuluh123');
  console.log('Penyuluh 3: penyuluh3 / penyuluh123');
  console.log('Kepala Bidang: kepalabidang / kepalabidang123');
  console.log('Kepala Dinas: kepaladinas / kepaladinas123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('✅ Seed completed successfully! 🎉');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

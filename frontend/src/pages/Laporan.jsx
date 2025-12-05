import { useEffect, useState } from 'react';
import { laporanService } from '../services/laporanService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Laporan = () => {
  const [laporanType, setLaporanType] = useState('petani');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLaporan();
  }, [laporanType]);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      let response;
      if (laporanType === 'petani') {
        response = await laporanService.getLaporanPetani();
      } else if (laporanType === 'kelompok-tani') {
        response = await laporanService.getLaporanKelompokTani();
      } else if (laporanType === 'komoditas') {
        response = await laporanService.getLaporanKomoditas();
      }
      setData(response || []);
    } catch (error) {
      console.error('Error fetching laporan:', error);
      alert('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await laporanService.exportExcel(laporanType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan_${laporanType}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Gagal mengekspor ke Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await laporanService.exportPDF(laporanType);
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text(`Laporan ${laporanType === 'petani' ? 'Petani' : laporanType === 'kelompok-tani' ? 'Kelompok Tani' : 'Komoditas'}`, 14, 15);
      
      if (laporanType === 'petani') {
        const tableData = response.data.map(item => [
          item.nama,
          item.nik,
          item.kecamatan?.nama || '-',
          item.luasLahan,
          item.jenisTanaman
        ]);
        doc.autoTable({
          head: [['Nama', 'NIK', 'Kecamatan', 'Luas Lahan (Ha)', 'Komoditas']],
          body: tableData,
          startY: 20
        });
      } else if (laporanType === 'kelompok-tani') {
        const tableData = response.data.map(item => [
          item.nama,
          item.ketua,
          item.jumlahAnggota,
          item.kecamatan?.nama || '-',
          item.luasLahanTotal?.toFixed(2) || '0'
        ]);
        doc.autoTable({
          head: [['Nama Kelompok', 'Ketua', 'Jumlah Anggota', 'Kecamatan', 'Luas Lahan (Ha)']],
          body: tableData,
          startY: 20
        });
      } else if (laporanType === 'komoditas') {
        const tableData = response.data.map(item => [
          item.jenis,
          item.luasTanam,
          item.estimasiPanen || '-',
          item.jenisPupuk || '-',
          item.pestisida || '-'
        ]);
        doc.autoTable({
          head: [['Jenis', 'Luas Tanam (Ha)', 'Estimasi Panen (Ton)', 'Pupuk', 'Pestisida']],
          body: tableData,
          startY: 20
        });
      }
      
      doc.save(`laporan_${laporanType}.pdf`);
    } catch (error) {
      alert('Gagal mengekspor ke PDF');
    }
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Laporan</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <select
          value={laporanType}
          onChange={(e) => setLaporanType(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="petani">Laporan Petani</option>
          <option value="kelompok-tani">Laporan Kelompok Tani</option>
          <option value="komoditas">Laporan Komoditas</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Memuat data...</div>
        ) : (
          <div className="overflow-x-auto">
            {laporanType === 'petani' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIK</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kecamatan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Luas Lahan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Komoditas</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.nik}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.kecamatan?.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.luasLahan} Ha</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.jenisTanaman}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {laporanType === 'kelompok-tani' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kelompok</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ketua</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Anggota</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kecamatan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Luas Lahan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.ketua}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.jumlahAnggota}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.kecamatan?.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.luasLahanTotal?.toFixed(2)} Ha</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {laporanType === 'komoditas' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Luas Tanam</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estimasi Panen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pupuk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pestisida</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.jenis}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.luasTanam} Ha</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.estimasiPanen || '-'} Ton</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.jenisPupuk || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.pestisida || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Laporan;


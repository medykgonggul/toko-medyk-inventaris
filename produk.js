
const produkAwal = [
    { nama: "Laptop", harga: 5000000, stok: 10 },
    { nama: "Mouse", harga: 150000, stok: 25 },
    { nama: "Keyboard", harga: 250000, stok: 15 },
    { nama: "Headset", harga: 200000, stok: 8 },
    { nama: "Monitor", harga: 1500000, stok: 5 }
];

// Ambil data yang tersimpan di browser
const dataTersimpan = localStorage.getItem("daftarProduk");

// Jika belum ada data tersimpan, gunakan produk awal
let produk = dataTersimpan
    ? JSON.parse(dataTersimpan)
    : produkAwal;

// Simpan produk ke localStorage
function simpanProduk() {
    localStorage.setItem(
        "daftarProduk",
        JSON.stringify(produk)
    );
}

const daftarProduk = document.getElementById("daftarProduk");
const inputCari = document.getElementById("inputCari");
const filterStok = document.getElementById("filterStok");
const tombolReset = document.getElementById("tombolReset");
const jumlahProduk = document.getElementById("jumlahProduk");

const formProduk = document.getElementById("formProduk");
const namaProduk = document.getElementById("namaProduk");
const hargaProduk = document.getElementById("hargaProduk");
const stokProduk = document.getElementById("stokProduk");


const totalJenis = document.getElementById("totalJenis");
const totalStok = document.getElementById("totalStok");
const nilaiPersediaan = document.getElementById("nilaiPersediaan");
const tombolExport = document.getElementById("tombolExport");
const fileImport = document.getElementById("fileImport");
const tombolImport = document.getElementById("tombolImport");

function perbaruiDashboard() {
    // Menghitung jumlah jenis produk
    totalJenis.textContent = produk.length;

    // Menghitung seluruh stok
    const jumlahStok = produk.reduce(function(total, item) {
        return total + item.stok;
    }, 0);

    totalStok.textContent =
        jumlahStok.toLocaleString("id-ID");

    // Menghitung nilai persediaan berdasarkan harga x stok
    const nilai = produk.reduce(function(total, item) {
        return total + (item.harga * item.stok);
    }, 0);

    nilaiPersediaan.textContent =
        "Rp " + nilai.toLocaleString("id-ID");
}


// Menampilkan produk di halaman

function exportCSV() {
    const judulKolom = [
        "Nama Produk",
        "Harga",
        "Stok",
        "Nilai Persediaan"
    ];
    
function parseBarisCSV(baris) {
    const hasil = [];
    let nilai = "";
    let dalamKutipan = false;

    for (let i = 0; i < baris.length; i++) {
        const karakter = baris[i];

        if (karakter === '"') {
            if (dalamKutipan && baris[i + 1] === '"') {
                nilai += '"';
                i++;
            } else {
                dalamKutipan = !dalamKutipan;
            }
        } else if (karakter === "," && !dalamKutipan) {
            hasil.push(nilai);
            nilai = "";
        } else {
            nilai += karakter;
        }
    }

    hasil.push(nilai);
    return hasil;
}

async function importCSV() {
    const file = fileImport.files[0];

    if (!file) {
        alert("Pilih file CSV terlebih dahulu.");
        return;
    }

    try {
        const teks = (await file.text()).replace(/^\uFEFF/, "");
        const baris = teks.split(/\r?\n/).filter(function(b) {
            return b.trim() !== "";
        });

        if (baris.length < 2) {
            alert("File CSV tidak memiliki data produk.");
            return;
        }

        const header = parseBarisCSV(baris[0]).map(function(kolom) {
            return kolom.trim().toLowerCase();
        });

        const kolomNama = header.indexOf("nama produk");
        const kolomHarga = header.indexOf("harga");
        const kolomStok = header.indexOf("stok");

        if (kolomNama === -1 || kolomHarga === -1 || kolomStok === -1) {
            alert("Header CSV harus memiliki Nama Produk, Harga, dan Stok.");
            return;
        }

        const produkBaru = [];
        const namaDalamFile = new Set();

        for (let i = 1; i < baris.length; i++) {
            const kolom = parseBarisCSV(baris[i]);

            const nama = (kolom[kolomNama] || "").trim();
            const hargaTeks = (kolom[kolomHarga] || "").trim();
            const stokTeks = (kolom[kolomStok] || "").trim();

            const harga = Number(hargaTeks);
            const stok = Number(stokTeks);
            const kunciNama = nama.toLowerCase();

            if (
                !nama ||
                hargaTeks === "" ||
                stokTeks === "" ||
                !Number.isFinite(harga) ||
                harga <= 0 ||
                !Number.isSafeInteger(stok) ||
                stok < 0
            ) {
                throw new Error(
                    "Data tidak valid pada baris " + (i + 1) + "."
                );
            }

            if (namaDalamFile.has(kunciNama)) {
                throw new Error(
                    "Nama produk ganda di dalam file: " + nama
                );
            }

            namaDalamFile.add(kunciNama);
            produkBaru.push({ nama: nama, harga: harga, stok: stok });
        }

        const namaYangAda = new Set(
            produk.map(function(item) {
                return item.nama.toLowerCase();
            })
        );

        const duplikat = produkBaru.find(function(item) {
            return namaYangAda.has(item.nama.toLowerCase());
        });

        if (duplikat) {
            alert(
                "Produk " + duplikat.nama +
                " sudah ada. Tidak ada data yang diimpor."
            );
            return;
        }

        produk = produk.concat(produkBaru);
        simpanProduk();

        inputCari.value = "";
        filterStok.value = "semua";
        tampilkanProduk(produk);
        fileImport.value = "";

        alert(produkBaru.length + " produk berhasil diimpor!");
    } catch (error) {
        alert("Import gagal: " + error.message);
    }
}

tombolImport.addEventListener("click", importCSV);


    const barisData = produk.map(function(item) {
        return [
            item.nama,
            item.harga,
            item.stok,
            item.harga * item.stok
        ];
    });

    const semuaBaris = [judulKolom, ...barisData];

    const isiCSV = semuaBaris.map(function(baris) {
        return baris.map(function(nilai) {
            const teks = String(nilai).replace(/"/g, '""');
            return '"' + teks + '"';
        }).join(",");
    }).join("\r\n");

    const file = new Blob(
        ["\uFEFF" + isiCSV],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "data-produk.csv";
    link.click();

    URL.revokeObjectURL(url);
}

tombolExport.addEventListener("click", exportCSV);

function tampilkanProduk(data) {
    daftarProduk.replaceChildren();

    data.forEach(function(item) {
        const kartu = document.createElement("article");
        kartu.className = "produk";

        const nama = document.createElement("h2");
        nama.textContent = item.nama;

        const harga = document.createElement("p");
        harga.textContent =
            "Harga: Rp " + item.harga.toLocaleString("id-ID");

        const stok = document.createElement("p");
        stok.textContent = "Stok: " + item.stok + " unit";

        
const statusStok = document.createElement("p");

if (item.stok === 0) {
    statusStok.textContent = "Stok Habis";
    statusStok.className = "stok-habis";
} else if (item.stok <= 5) {
    statusStok.textContent = "Stok Menipis";
    statusStok.className = "stok-menipis";
} else {
    statusStok.textContent = "Stok Aman";
    statusStok.className = "stok-aman";
}


       

const tombolUbahStok = document.createElement("button");
tombolUbahStok.textContent = "Ubah Stok";

tombolUbahStok.addEventListener("click", function() {
    const stokBaru = prompt(
        "Masukkan jumlah stok baru untuk " + item.nama,
        item.stok
    );

    if (stokBaru === null || stokBaru.trim() === "") {
        return;
    }

    const angkaStok = Number(stokBaru);

    if (!Number.isInteger(angkaStok) || angkaStok < 0) {
        alert("Stok harus berupa bilangan bulat, minimal 0.");
        return;
    }

    // Simpan stok sebelum diubah
    const stokAwal = item.stok;

    // Perbarui stok produk
    item.stok = angkaStok;

    // Catat riwayat jika stok benar-benar berubah
    if (angkaStok !== stokAwal) {
        const jenisPerubahan = angkaStok > stokAwal
            ? "Stok bertambah"
            : "Stok berkurang";

        catatRiwayat(
            item.nama,
            jenisPerubahan,
            stokAwal,
            angkaStok
        );
    }

    // Simpan dan perbarui tampilan produk
    simpanProduk();
    tampilkanProduk(data);
});

/* TOMBOL BARANG MASUK */
const tombolBarangMasuk = document.createElement("button");
tombolBarangMasuk.textContent = "Barang Masuk";

tombolBarangMasuk.addEventListener("click", function() {
    const jumlah = prompt(
        "Berapa unit " + item.nama + " yang masuk?"
    );

    if (jumlah === null || jumlah.trim() === "") {
        return;
    }

    const angkaJumlah = Number(jumlah);

    if (!Number.isInteger(angkaJumlah) || angkaJumlah <= 0) {
        alert("Jumlah barang masuk harus berupa bilangan bulat positif.");
        return;
    }

    const stokAwal = item.stok;
    item.stok += angkaJumlah;

    catatRiwayat(
        item.nama,
        "Barang masuk (+" + angkaJumlah + ")",
        stokAwal,
        item.stok
    );

    simpanProduk();
    cariProduk();

    alert("Barang masuk berhasil dicatat!");
});


/* TOMBOL BARANG KELUAR */
const tombolBarangKeluar = document.createElement("button");
tombolBarangKeluar.textContent = "Barang Keluar";

tombolBarangKeluar.addEventListener("click", function() {
    const jumlah = prompt(
        "Berapa unit " + item.nama + " yang keluar?"
    );

    if (jumlah === null || jumlah.trim() === "") {
        return;
    }

    const angkaJumlah = Number(jumlah);

    if (!Number.isInteger(angkaJumlah) || angkaJumlah <= 0) {
        alert("Jumlah barang keluar harus berupa bilangan bulat positif.");
        return;
    }

    if (angkaJumlah > item.stok) {
        alert("Stok tidak mencukupi!");
        return;
    }

    const stokAwal = item.stok;
    item.stok -= angkaJumlah;

    catatRiwayat(
        item.nama,
        "Barang keluar (-" + angkaJumlah + ")",
        stokAwal,
        item.stok
    );

    simpanProduk();
    cariProduk();

    alert("Barang keluar berhasil dicatat!");
});

const tombolEdit = document.createElement("button");
tombolEdit.textContent = "Edit Produk";

tombolEdit.addEventListener("click", function() {
    const namaBaru = prompt(
        "Masukkan nama produk baru:",
        item.nama
    );

    if (namaBaru === null) {
        return;
    }

    const namaBersih = namaBaru.trim();

    if (namaBersih === "") {
        alert("Nama produk tidak boleh kosong.");
        return;
    }

    const namaSudahAda = produk.some(function(p) {
        return p !== item &&
            p.nama.toLowerCase() === namaBersih.toLowerCase();
    });

    if (namaSudahAda) {
        alert("Nama produk tersebut sudah digunakan.");
        return;
    }

    const hargaBaru = prompt(
        "Masukkan harga produk baru:",
        item.harga
    );

    if (hargaBaru === null || hargaBaru.trim() === "") {
        return;
    }

    const angkaHarga = Number(hargaBaru);

    if (!Number.isFinite(angkaHarga) || angkaHarga <= 0) {
        alert("Harga harus berupa angka lebih dari 0.");
        return;
    }

    item.nama = namaBersih;
    item.harga = angkaHarga;

    simpanProduk();
    cariProduk();

    alert("Produk berhasil diperbarui!");
});


const tombolHapus = document.createElement("button");
tombolHapus.textContent = "Hapus Produk";

tombolHapus.addEventListener("click", function() {
    const yakin = confirm(
        "Apakah kamu yakin ingin menghapus " + item.nama + "?"
    );

    if (!yakin) {
        return;
    }

    produk = produk.filter(function(p) {
        return p !== item;
    });

    simpanProduk();
    cariProduk();
});



kartu.append(
    nama,
    harga,
    stok,
    statusStok,
    tombolUbahStok,
    tombolBarangMasuk,
    tombolBarangKeluar,
    tombolEdit,
    tombolHapus
);


daftarProduk.appendChild(kartu);

    });

    jumlahProduk.textContent =
        "Menampilkan " + data.length + " produk";

    
if (data.length === 0) {
    const pesan = document.createElement("p");
    pesan.textContent = "Produk tidak ditemukan.";
    daftarProduk.appendChild(pesan);
}

// PERBARUI DASHBOARD
perbaruiDashboard();

}



// Fitur pencarian

function cariProduk() {
    const kataKunci = inputCari.value.trim().toLowerCase();
    const statusDipilih = filterStok.value;

    const hasil = produk.filter(function(item) {
        const cocokNama = item.nama
            .toLowerCase()
            .includes(kataKunci);

        let cocokStok = true;

        if (statusDipilih === "menipis") {
            cocokStok = item.stok > 0 && item.stok <= 5;
        } else if (statusDipilih === "habis") {
            cocokStok = item.stok === 0;
        } else if (statusDipilih === "aman") {
            cocokStok = item.stok > 5;
        }

        return cocokNama && cocokStok;
    });

    tampilkanProduk(hasil);
}


// Fitur tambah produk
formProduk.addEventListener("submit", function(event) {
    event.preventDefault();

    const nama = namaProduk.value.trim();
    const harga = Number(hargaProduk.value);
    const stok = Number(stokProduk.value);

    if (
        nama === "" ||
        hargaProduk.value === "" ||
        stokProduk.value === "" ||
        !Number.isFinite(harga) ||
        !Number.isFinite(stok) ||
        harga <= 0 ||
        stok < 0
    ) {
        alert("Masukkan nama, harga, dan stok yang valid.");
        return;
    }

    const sudahAda = produk.some(function(item) {
        return item.nama.toLowerCase() === nama.toLowerCase();
    });

    if (sudahAda) {
        alert("Produk tersebut sudah ada!");
        return;
    }

    produk.push({
        nama: nama,
        harga: harga,
        stok: stok
    });

    // Simpan setelah menambahkan produk
    simpanProduk();

    formProduk.reset();
    inputCari.value = "";

    tampilkanProduk(produk);

    alert("Produk berhasil ditambahkan dan disimpan!");
});

// Event pencarian
inputCari.addEventListener("input", cariProduk);
filterStok.addEventListener("change", cariProduk);

// Tombol reset pencarian
tombolReset.addEventListener("click", function() {
    inputCari.value = "";
    tampilkanProduk(produk);
});

// Simpan produk awal saat pertama kali digunakan
if (dataTersimpan === null) {
    simpanProduk();
}

// Tampilkan semua produk
tampilkanProduk(produk);


const daftarRiwayat = document.getElementById("daftarRiwayat");
const filterRiwayat = document.getElementById("filterRiwayat");

// Ambil riwayat dari penyimpanan browser
let riwayatStok = JSON.parse(
    localStorage.getItem("riwayatStok") || "[]"
);

// Simpan satu catatan perubahan stok

function  catatRiwayat(nama, jenis, stokAwal, stokAkhir) {
    const catatan = {
        waktu: new Date().toLocaleString("id-ID"),
        nama: nama,
        jenis: jenis,
        stokAwal: stokAwal,
        stokAkhir: stokAkhir
    };

    riwayatStok.unshift(catatan);

    localStorage.setItem(
        "riwayatStok",
        JSON.stringify(riwayatStok)
    );

    tampilkanRiwayat();
    tampilkanLaporan();
    tampilkanGrafikInventaris();
}

// Tampilkan semua catatan ke tabel

function tampilkanRiwayat() {
    if (!daftarRiwayat) return;

    const pilihan = filterRiwayat
        ? filterRiwayat.value
        : "semua";

    let dataTampil = riwayatStok;

    if (pilihan === "masuk") {
        dataTampil = riwayatStok.filter(function(item) {
            return item.jenis.toLowerCase().includes("barang masuk");
        });
    } else if (pilihan === "keluar") {
        dataTampil = riwayatStok.filter(function(item) {
            return item.jenis.toLowerCase().includes("barang keluar");
        });
    } else if (pilihan === "perubahan") {
        dataTampil = riwayatStok.filter(function(item) {
            const jenis = item.jenis.toLowerCase();

            return !jenis.includes("barang masuk") &&
                   !jenis.includes("barang keluar");
        });
    }

    daftarRiwayat.innerHTML = "";

    if (dataTampil.length === 0) {
        daftarRiwayat.innerHTML = `
            <tr>
                <td colspan="5">Tidak ada transaksi untuk filter ini.</td>
            </tr>
        `;
        return;
    }

    dataTampil.forEach(function(item) {
        const baris = document.createElement("tr");

        [
            item.waktu,
            item.nama,
            item.jenis,
            item.stokAwal,
            item.stokAkhir
        ].forEach(function(nilai) {
            const sel = document.createElement("td");
            sel.textContent = nilai;
            baris.appendChild(sel);
        });

        daftarRiwayat.appendChild(baris);
    });
}

if (filterRiwayat) {
    filterRiwayat.addEventListener("change", tampilkanRiwayat);
}


function tampilkanLaporan() {
    const totalBarangMasuk = document.getElementById(
        "totalBarangMasuk"
    );

    const totalBarangKeluar = document.getElementById(
        "totalBarangKeluar"
    );

    const jumlahTransaksi = document.getElementById(
        "jumlahTransaksi"
    );

    if (!totalBarangMasuk ||
        !totalBarangKeluar ||
        !jumlahTransaksi) {
        return;
    }

    let totalMasuk = 0;
    let totalKeluar = 0;

    riwayatStok.forEach(function(item) {
        const selisih =
            Number(item.stokAkhir) - Number(item.stokAwal);

        if (selisih > 0) {
            totalMasuk += selisih;
        } else if (selisih < 0) {
            totalKeluar += Math.abs(selisih);
        }
    });

    totalBarangMasuk.textContent = totalMasuk + " unit";
    totalBarangKeluar.textContent = totalKeluar + " unit";
    jumlahTransaksi.textContent = riwayatStok.length;
}


// Tampilkan riwayat ketika halaman dibuka
tampilkanRiwayat();
tampilkanLaporan();


function exportLaporanCSV() {
    let totalMasuk = 0;
    let totalKeluar = 0;

    riwayatStok.forEach(function(item) {
        const selisih =
            Number(item.stokAkhir) - Number(item.stokAwal);

        if (selisih > 0) {
            totalMasuk += selisih;
        } else if (selisih < 0) {
            totalKeluar += Math.abs(selisih);
        }
    });

    // Membuat isi laporan CSV
    const barisCSV = [
        ["LAPORAN TRANSAKSI INVENTARIS"],
        [],
        ["Total Barang Masuk", totalMasuk + " unit"],
        ["Total Barang Keluar", totalKeluar + " unit"],
        ["Total Transaksi", riwayatStok.length],
        [],
        [
            "Waktu",
            "Nama Produk",
            "Jenis Perubahan",
            "Stok Awal",
            "Stok Akhir"
        ]
    ];

    // Memasukkan seluruh riwayat transaksi
    riwayatStok.forEach(function(item) {
        barisCSV.push([
            item.waktu,
            item.nama,
            item.jenis,
            item.stokAwal,
            item.stokAkhir
        ]);
    });

    // Mengubah data menjadi teks CSV
    const isiCSV = "\uFEFF" + barisCSV
        .map(function(baris) {
            return baris.map(function(nilai) {
                return '"' +
                    String(nilai ?? "").replace(/"/g, '""') +
                    '"';
            }).join(";");
        })
        .join("\r\n");

    // Membuat file untuk diunduh
    const file = new Blob([isiCSV], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "laporan-transaksi-inventaris.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    alert("Laporan transaksi berhasil diekspor!");
}

// Menghubungkan tombol dengan fungsi export
const tombolExportLaporan =
    document.getElementById("tombolExportLaporan");

if (tombolExportLaporan) {
    tombolExportLaporan.addEventListener(
        "click",
        exportLaporanCSV
    );
}

const tombolCetakLaporan =
    document.getElementById("tombolCetakLaporan");

if (tombolCetakLaporan) {
    tombolCetakLaporan.addEventListener("click", function() {
        window.print();
    });
}


let grafikInventaris = null;

function tampilkanGrafikInventaris(data = riwayatStok) {
    const canvas = document.getElementById("grafikInventaris");

    if (!canvas || typeof Chart === "undefined") {
        console.warn("Canvas grafik atau library Chart.js belum tersedia.");
        return;
    }

    let totalMasuk = 0;
    let totalKeluar = 0;

    data.forEach(function(item) {
        const selisih =
            Number(item.stokAkhir) - Number(item.stokAwal);

        if (selisih > 0) {
            totalMasuk += selisih;
        } else if (selisih < 0) {
            totalKeluar += Math.abs(selisih);
        }
    });

    const dataGrafik = {
        labels: ["Barang Masuk", "Barang Keluar"],
        datasets: [{
            label: "Jumlah Barang (unit)",
            data: [totalMasuk, totalKeluar],
            backgroundColor: ["#16a34a", "#dc2626"],
            borderRadius: 8,
            maxBarThickness: 100
        }]
    };

    if (grafikInventaris) {
        grafikInventaris.data = dataGrafik;
        grafikInventaris.update();
        return;
    }

    grafikInventaris = new Chart(canvas, {
        type: "bar",
        data: dataGrafik,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + " unit";
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    },
                    title: {
                        display: true,
                        text: "Jumlah Barang (unit)"
                    }
                }
            }
        }
    });
}

// Tampilkan grafik ketika halaman dibuka
tampilkanGrafikInventaris();

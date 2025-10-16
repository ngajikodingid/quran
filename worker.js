export default {
  async fetch(request, env, ctx) {
    // Atur CORS agar bisa diakses dari domain Anda atau semua domain (*)
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json'
    };

    // Prompt yang akan dikirim ke AI
    const prompt = "Berapa harga 1 gram emas batangan Antam dalam Rupiah hari ini di Indonesia? Jawab HANYA dengan angka saja, tanpa titik, koma, atau teks tambahan. Contoh: 2400000";

    try {
      // Panggil Google AI (Gemini) API
      // Pastikan Anda menyimpan API Key di Settings > Variables > Environment Variables dengan nama GEMINI_API_KEY
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!geminiResponse.ok) {
        throw new Error('Gagal menghubungi Google AI API');
      }

      const geminiData = await geminiResponse.json();
      // Ekstrak teks jawaban dari AI
      const hargaEmasText = geminiData.candidates[0].content.parts[0].text.trim();
      
      // Pastikan jawabannya adalah angka
      const hargaEmas = parseInt(hargaEmasText.replace(/\D/g, ''));
      if (isNaN(hargaEmas)) {
        throw new Error('Jawaban AI bukan angka yang valid.');
      }

      // Kirim jawaban sukses ke frontend
      const responseBody = JSON.stringify({
        success: true,
        harga: hargaEmas,
        sumber: 'Google AI (Gemini Pro)',
      });

      return new Response(responseBody, { headers: corsHeaders });

    } catch (error) {
      console.error('Error di Cloudflare Worker:', error);
      // Kirim pesan error ke frontend
      const errorBody = JSON.stringify({
        success: false,
        message: error.message,
        harga: 2400000, // Kirim harga default jika gagal
      });
      return new Response(errorBody, { status: 500, headers: corsHeaders });
    }
  },
};

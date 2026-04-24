const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 🔹 GET reservas
app.get('/reservas', async (req, res) => {
  const { fecha } = req.query;

  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .eq('fecha', fecha);

  if (error) return res.status(500).json({ error });

  res.json(data);
});

// 🔹 POST reserva
app.post('/reservas', async (req, res) => {
  const { fecha, hora_inicio, nombre, apartamento } = req.body;

  const { error } = await supabase
    .from('reservas')
    .insert([{ fecha, hora_inicio, nombre, apartamento }]);

  if (error) return res.status(500).json({ error });

  res.json({ mensaje: 'Reserva creada ✅' });
});

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
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

app.get('/reservas', async (req, res) => {
  const { fecha } = req.query;
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .eq('fecha', fecha);
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.post('/reservas', async (req, res) => {
  const { fecha, hora_inicio, nombre, cedula, conjunto, torre, apartamento } = req.body;

  // Validar que no haya reservado ese mismo día
  const { data: reservaExistente } = await supabase
    .from('reservas')
    .select('*')
    .eq('fecha', fecha)
    .eq('cedula', cedula)
    .single();

  if (reservaExistente) {
    return res.status(409).json({ error: 'Ya tienes una reserva para ese día' });
  }

  const { error } = await supabase
    .from('reservas')
    .insert([{ fecha, hora_inicio, nombre, cedula, conjunto, torre, apartamento }]);

  if (error) return res.status(500).json({ error });

  res.json({ mensaje: 'Reserva creada ✅' });
});
app.post('/residentes', async (req, res) => {
  const { nombre, cedula, conjunto, torre, apartamento } = req.body;

  // Verificar si la cédula ya está registrada
  const { data: existente } = await supabase
    .from('residentes')
    .select('*')
    .eq('cedula', cedula)
    .single();

  if (existente) {
    return res.status(409).json({ error: 'Esta cédula ya está registrada' });
  }

  const { error } = await supabase
    .from('residentes')
    .insert([{ nombre, cedula, conjunto, torre, apartamento }]);

  if (error) return res.status(500).json({ error });

  res.json({ mensaje: 'Registro exitoso ✅' });
});
app.post('/login', async (req, res) => {
  const { nombre, cedula } = req.body;

  const { data: residente, error } = await supabase
    .from('residentes')
    .select('*')
    .eq('cedula', cedula)
    .single();

  if (error || !residente) {
    return res.status(404).json({ error: 'No estás registrado. Por favor regístrate primero' });
  }

  if (residente.nombre.toLowerCase() !== nombre.toLowerCase()) {
    return res.status(403).json({ error: 'El nombre no coincide con la cédula' });
  }

  res.json({ residente });
});
app.get('/admin/reservas', async (req, res) => {
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .order('fecha', { ascending: false });
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.get('/admin/residentes', async (req, res) => {
  const { data, error } = await supabase
    .from('residentes')
    .select('*')
    .order('nombre', { ascending: true });
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.delete('/admin/reservas', async (req, res) => {
  const { error } = await supabase
    .from('reservas')
    .delete()
    .neq('id', 0);
  if (error) return res.status(500).json({ error });
  res.json({ mensaje: 'Reservas borradas ✅' });
});
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
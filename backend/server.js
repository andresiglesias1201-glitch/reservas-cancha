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

  // Validación 1: Verificar que el apartamento existe
  const { data: residente, error: errorResidente } = await supabase
    .from('residentes')
    .select('*')
    .eq('cedula', cedula)
    .eq('conjunto', conjunto)
    .eq('torre', torre)
    .eq('apartamento', apartamento)
    .single();

  if (errorResidente || !residente) {
    return res.status(403).json({ error: 'Los datos no coinciden con ningún residente registrado' });
  }

  // Validación 2: Verificar que la cédula coincide con el nombre
  if (residente.nombre.toLowerCase() !== nombre.toLowerCase()) {
    return res.status(403).json({ error: 'El nombre no coincide con la cédula registrada' });
  }

  // Validación 3: Verificar que no ha reservado ese mismo día
  const { data: reservaExistente } = await supabase
    .from('reservas')
    .select('*')
    .eq('fecha', fecha)
    .eq('cedula', cedula)
    .single();

  if (reservaExistente) {
    return res.status(409).json({ error: 'Ya tienes una reserva para ese día' });
  }

  // Crear la reserva
  const { error } = await supabase
    .from('reservas')
    .insert([{ fecha, hora_inicio, nombre, cedula, conjunto, torre, apartamento }]);

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
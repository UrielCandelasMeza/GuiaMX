import { readdirSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const scriptsDir = join(__dirname);

// Obtener todos los archivos .json en la carpeta actual
const files = readdirSync(scriptsDir).filter(
  (file) => file.endsWith(".json") && !file.includes("package") && !file.includes("tsconfig")
);

if (files.length === 0) {
  console.log("No se encontraron archivos JSON en la carpeta scripts.");
  process.exit(0);
}

console.log(`🚀 Iniciando seed masivo: se encontraron ${files.length} archivos JSON.\n`);

let exitos = 0;
let errores = 0;

for (const file of files) {
  const filePath = join(scriptsDir, file);
  console.log(`\n==================================================`);
  console.log(`🔄 Procesando: ${file}`);
  console.log(`==================================================`);

  try {
    // Ejecutamos el script usando paths relativos desde la raíz de /api
    execSync(`bun run scripts/script.ts scripts/${file} --upsert`, {
      stdio: "inherit",
    });
    exitos++;
  } catch (error) {
    console.error(`\n❌ Falló la importación de ${file}`);
    errores++;
  }
}

console.log(`\n==================================================`);
console.log(`✅ SEED MASIVO COMPLETADO`);
console.log(`   Éxitos : ${exitos}`);
console.log(`   Errores: ${errores}`);
console.log(`==================================================\n`);

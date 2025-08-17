// debug-connection.js
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Iniciando diagnóstico de conexión...\n');
  
  // 1. Verificar variables de entorno
  console.log('📋 Variables de entorno:');
  console.log('DATABASE_URL presente:', !!process.env.DATABASE_URL);
  console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
  
  // Mostrar URL censurada (sin contraseña)
  if (process.env.DATABASE_URL) {
    const urlCensurada = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
    console.log('DATABASE_URL:', urlCensurada);
  }
  console.log('');
  
  // 2. Probar diferentes configuraciones de Prisma
  const configs = [
    {
      name: 'Configuración básica',
      options: {}
    },
    {
      name: 'Con timeout extendido',
      options: {
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        }
      }
    },
    {
      name: 'Con SSL y timeout',
      options: {
        datasources: {
          db: {
            url: process.env.DATABASE_URL + '?sslmode=require&connect_timeout=60'
          }
        }
      }
    }
  ];
  
  for (const config of configs) {
    console.log(`🧪 Probando: ${config.name}`);
    const prisma = new PrismaClient(config.options);
    
    try {
      console.log('   Conectando...');
      await prisma.$connect();
      console.log('   ✅ Conexión exitosa');
      
      console.log('   Probando query simple...');
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log('   ✅ Query exitosa');
      
      await prisma.$disconnect();
      console.log('   ✅ Desconexión exitosa\n');
      break; // Si llega aquí, la conexión funciona
      
    } catch (error) {
      console.log('   ❌ Error:', error.message);
      console.log('   📊 Código de error:', error.code);
      await prisma.$disconnect().catch(() => {});
      console.log('');
    }
  }
}

// Ejecutar test
testConnection()
  .then(() => {
    console.log('🏁 Diagnóstico completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
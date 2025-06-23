#!/usr/bin/env python3
"""
Script para verificar la integridad del código y generar migraciones
"""

import os
import sys
import subprocess
import django
from pathlib import Path

# Configurar el entorno de Django
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cmms_project.settings')

def run_command(command, description):
    """Ejecuta un comando y maneja errores"""
    print(f"\n{'='*50}")
    print(f"EJECUTANDO: {description}")
    print(f"COMANDO: {command}")
    print(f"{'='*50}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=BASE_DIR)
        
        if result.stdout:
            print("SALIDA:")
            print(result.stdout)
        
        if result.stderr:
            print("ERRORES/ADVERTENCIAS:")
            print(result.stderr)
        
        if result.returncode != 0:
            print(f"❌ ERROR: El comando falló con código {result.returncode}")
            return False
        else:
            print("✅ ÉXITO: Comando ejecutado correctamente")
            return True
            
    except Exception as e:
        print(f"❌ EXCEPCIÓN: {str(e)}")
        return False

def check_python_syntax():
    """Verifica la sintaxis de Python en todos los archivos .py"""
    print("\n🔍 VERIFICANDO SINTAXIS DE PYTHON...")
    
    python_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        # Excluir directorios de migración y cache
        dirs[:] = [d for d in dirs if d not in ['__pycache__', 'migrations', '.git']]
        for file in files:
            if file.endswith('.py'):
                python_files.append(os.path.join(root, file))
    
    errors = []
    for file_path in python_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                compile(f.read(), file_path, 'exec')
            print(f"✅ {file_path}")
        except SyntaxError as e:
            error_msg = f"❌ {file_path}: {e}"
            print(error_msg)
            errors.append(error_msg)
        except Exception as e:
            error_msg = f"⚠️ {file_path}: {e}"
            print(error_msg)
    
    if errors:
        print(f"\n❌ Se encontraron {len(errors)} errores de sintaxis:")
        for error in errors:
            print(f"  - {error}")
        return False
    else:
        print(f"\n✅ Todos los {len(python_files)} archivos Python tienen sintaxis correcta")
        return True

def main():
    """Función principal"""
    print("🚀 INICIANDO VERIFICACIÓN DE INTEGRIDAD DEL CÓDIGO CMMS")
    print(f"📁 Directorio base: {BASE_DIR}")
    
    # Lista de verificaciones a realizar
    checks = [
        ("Verificación de sintaxis Python", check_python_syntax),
        ("Verificación de configuración Django", lambda: run_command("python manage.py check", "Django Check")),
        ("Creación de migraciones", lambda: run_command("python manage.py makemigrations", "Crear migraciones")),
        ("Verificación de migraciones", lambda: run_command("python manage.py check --deploy", "Verificar configuración de despliegue")),
        ("Recolección de archivos estáticos", lambda: run_command("python manage.py collectstatic --noinput --dry-run", "Verificar archivos estáticos")),
    ]
    
    results = []
    for description, check_func in checks:
        print(f"\n📋 {description}...")
        success = check_func()
        results.append((description, success))
    
    # Resumen final
    print(f"\n{'='*60}")
    print("📊 RESUMEN DE VERIFICACIONES")
    print(f"{'='*60}")
    
    passed = 0
    failed = 0
    
    for description, success in results:
        status = "✅ PASÓ" if success else "❌ FALLÓ"
        print(f"{status}: {description}")
        if success:
            passed += 1
        else:
            failed += 1
    
    print(f"\n📈 ESTADÍSTICAS:")
    print(f"  - Verificaciones exitosas: {passed}")
    print(f"  - Verificaciones fallidas: {failed}")
    print(f"  - Total: {len(results)}")
    
    if failed == 0:
        print(f"\n🎉 ¡TODAS LAS VERIFICACIONES PASARON!")
        print("El código está listo para ejecutarse.")
        return True
    else:
        print(f"\n⚠️ SE ENCONTRARON {failed} PROBLEMAS")
        print("Revisa los errores anteriores antes de continuar.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)


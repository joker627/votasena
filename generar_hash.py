import getpass
import bcrypt

print("==================================================")
print("  Generador de Hash BCRYPT (Seguridad VotaSena)   ")
print("==================================================")

password = input("\nIngresa la contraseña que deseas encriptar: ")

if password.strip():
    # Encriptamos directamente con bcrypt
    hash_result = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    print("\n[RESULTADO]")
    print(f"Hash BCRYPT: {hash_result}")
    print("\n¡Listo! Puedes copiar la cadena de arriba y pegarla")
    print("directamente en la columna 'codigo_hash' de tu base de datos (MySQL).")
else:
    print("\n[ERROR] No ingresaste ninguna contraseña.")

print("\nPresiona Enter para salir...")
input()

# Netlify Functions - Environment Variables Setup Guide

## Configurar en Netlify Dashboard

1. Ve a tu sitio en Netlify: https://app.netlify.com
2. Sitio → Site settings → Environment variables
3. Click "Add a variable" para cada una:

### Variables Requeridas:

**FIREBASE_PROJECT_ID**
```
istqbproject
```

**FIREBASE_CLIENT_EMAIL**
```
firebase-adminsdk-fbsvc@istqbproject.iam.gserviceaccount.com
```

**FIREBASE_PRIVATE_KEY**
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDXlcamWrjVuMRT
5F3UL7kixwLh1k3Js6w/gorYgnwGti1aK/uXpNDfuK07/tIyMaQ1ThdvDIegNlaE
S8eZJXdRc2YZk9ycxEOKAjAfix0KbjjhqrkMTmOp1KAYxUXJeanfN9bG1CM1iT4N
llgEkwL+5YF3gKi37RbUe5uaKWWG6l83N9MtziFU5MTKkO4mvCo1QYh78efiXY4w
MZlSuCuudm2Gxtx1ZOqMsO7MuYml+CSaMFh4Lx0kArGdCbzIQhnO2OFIV8grZrxS
JcvOHv3zsAT1KJds39L+MpV4rWLDH6S6IZlhd+Atf/Ui08LS2Bduzo2RerHomIxv
+lA0darXAgMBAAECggEAASYt5jpwPHNnrdV3H+fBN4uSsFwmvf8p2Td7lfvcErfA
i3fV4iZha/qIBzHXMlKhasdSc1JrG/zY0+EI3KrJIAiwGqLMd5Qe6ArARurEP4dR
i6JlVMjLhImQRjwxoF6i+9WdsiGfWRcKME2vhRa42rL5JbHsiaPHOLVlTEURjXk1
LHu4LQKoapLIC9MSV7LFlNUx+GiRmJAdQ7eRO9ZGgGoFdn/ScUfsAjIAH6BtFrmL
Ni1QEiJj9WjkmPzfY+waWdQQOAiaBhDNcPaxPCDTkEmIpUPbUxF0ALU6OhaTFxa+
cYU3vrMG2tvTKmxReImCZ6vM1iqmcjiR9JmQCs1VQQKBgQDznB6lQWlSrja2SMq7
rW3c2N7oeJugwjsvd0rOof0GDx8Gr1LZlzXKCkO8EiVf0VYvcl4pMiBO+tjBI9vJ
Bp6ibxUtCobFaEEyCKZGhHhBzEQao3t923eSxBsU8E8Lkdof0K/2y4bbZSf39msk
dQL4KvFsDfY4KUiKy4Sxdk+FBQKBgQDijMOwUePDAC8Re5S7MSk2M0Q8Jpso+7SS
odGTbqXkI9f6+qoJ4FwbDK3xDECV7woQuAwj9CHKZhjVsMYaQgKIhg5q41JvOEgZ
mn/dHSX705BcivT5ImzXEhs2xlDGVwLuPrMmjgw3L+gX3KopdwHd6VTxK/Rklv7H
Itu+uEF3KwKBgQCc4MDrcwA8emxJXv8PdVP2kMKbum+eSvaKTqwh/TdQG5TDXUxh
S3scLRgJmTXwSoLR8zioFtuvgOLtHgZ/on+t4xMj+k9n+QdjDSbm6o/273A8J2Nz
XU3XeepmxYphzP9G1cE7kT27M51VlZ7Rz3imECGAkE0rRYqttvowvhvfcQKBgEBH
lmKZ6ZjznWdFfD7cxQe25h53CcFIIcUVGuTNGU6xCOASbVqeCSQ3pcbmJhEkoON7
hR5Sb6AA9fzzylG69wMLnl2foE0kV/jDyJHRamyYa7aGStnBdcZUQdp5zINqPs+g
hK5k0Xx7IExc9P8M4D+5q7s+MHq2CRYxgs4Lc6+/AoGAPgTrAwX1QnWmh7FFUnEH
Ix7zg0Nkj85KGVEMyE/P/oP2HVhmEdzM7kuAAA4WkDRSwxKiJZS9dfQFH5ob2oJh
bAQlYXtYBZla0exxyJp3DGWqZLS76O1o6r88Wi+pJ/VP5HothuFZ4uJv1Edqckzg
3B9D+SbmE4Z5c1/fuh+UJhY=
-----END PRIVATE KEY-----
```

**PAYPHONE_TOKEN**
```
5rDff4Dujq2aM6rqUPLFMRh2H933vKVGthSlumsGZRe-rmvz-ntuA_lwaYpqLCXI4OpsoufvYnYpujaMLGvq-QBOIEy4ogx1bnhugvCz8xkxgPKzKgXwulSA9vhNc_PG5V4zANzZTFRn3oNjH5uKA_tPkWkWqmeNHt47f56f1Z13HbNZz8pW2E_csIhpgYu92sUzyELGe9uklHFJbnp8CQogBP00FW7Hx4MwMaOK83Zq8zzNhntdB4tpJdPtuD5Ak19Inh_YZiSj2W9r3p5F0hXzrkXc1sPOBddTf_3b0JH0KGhF28yVnHYLJjyAwt4DT16s5g
```

## IMPORTANTE

⚠️ **NO subir este archivo al repositorio Git**  
⚠️ Ya está en `.gitignore` para prevenir exposición  
⚠️ Las credenciales deben estar SOLO en Netlify Dashboard  

## Después de configurar:

1. Redeploy en Netlify para que tome las variables
2. Las functions estarán disponibles en:
   - `https://tu-sitio.netlify.app/.netlify/functions/activate-premium`
   - `https://tu-sitio.netlify.app/.netlify/functions/can-take-exam`

/* Este es un comentario */
-- Aquí creamos una tabla con 6 columnas
CREATE TABLE personas
(
    nombre VARCHAR,
    sexo VARCHAR,
    edad INT,
    estatura DOUBLE,
    nacimiento DATE,
    check BOOLEAN
);
/********************************
Código que no debe ejecutarse:

SELECT * from tabla_inexistente;
********************************/
BEGIN
    DECLARE @fecha VARCHAR;
    DECLARE @sexo VARCHAR;
    -- Cambiar nombre de tabla
    ALTER TABLE personas RENAME TO people;
    -- Loop para llenar la tabla con datos
    FOR i IN 10..25
    BEGIN
        SET @fecha = "2010-01-"+CAST(i AS VARCHAR);
        -- Alternar entre M y F
        IF i % 2 = 0 THEN
            SET @sexo = "M";
        ELSE
            SET @sexo = "F";
        END IF;
        INSERT INTO people (nombre, edad, estatura, sexo, nacimiento, check)
        VALUES
        (
            "persona"+CAST(i AS VARCHAR),
            i%5+(i*10),
            (1.23*i)/2,
            @sexo,
            CAST(@fecha AS DATE),
            i % 2 = 0
        );
        CASE @sexo
            WHEN "M" THEN "Hombre"
            WHEN "F" THEN "Mujer"
            ELSE "A saber que onda"
        END AS "Sexo de persona";
    END;
    -- Devolver a nombre anterior
    ALTER TABLE people RENAME TO personas;
END;

/* Resultado SELECT
| nombre    | sexo | edad | estatura    | nacimiento | check |
| --------- | ---- | ---- | ----------- | ---------- | ----- |
| persona10 | M    | 100  | 6.15000000  | 2010-01-10 | true  |
| persona11 | F    | 111  | 6.76500000  | 2010-01-11 | false |
| persona12 | M    | 122  | 7.38000000  | 2010-01-12 | true  |
| persona13 | F    | 133  | 7.99500000  | 2010-01-13 | false |
| persona14 | M    | 144  | 8.61000000  | 2010-01-14 | true  |
| persona15 | F    | 150  | 9.22500000  | 2010-01-15 | false |
| persona16 | M    | 161  | 9.84000000  | 2010-01-16 | true  |
| persona17 | F    | 172  | 10.45500000 | 2010-01-17 | false |
| persona18 | M    | 183  | 11.07000000 | 2010-01-18 | true  |
| persona19 | F    | 194  | 11.68500000 | 2010-01-19 | false |
| persona20 | M    | 200  | 12.30000000 | 2010-01-20 | true  |
| persona21 | F    | 211  | 12.91500000 | 2010-01-21 | false |
| persona22 | M    | 222  | 13.53000000 | 2010-01-22 | true  |
| persona23 | F    | 233  | 14.14500000 | 2010-01-23 | false |
| persona24 | M    | 244  | 14.76000000 | 2010-01-24 | true  |
| persona25 | F    | 250  | 15.37500000 | 2010-01-25 | false |
*/
SELECT * FROM personas;

BEGIN
    DECLARE @local_num INT DEFAULT 0;
    /*
    Veamos si el programa
    truena con el WHILE
    */
    WHILE @local_num <= 10
    BEGIN
        CASE @local_num
            WHEN @local_num % 5 = 0 THEN CAST(@local_num AS VARCHAR)+" Es multiplo de 5"
            ELSE CAST(@local_num AS VARCHAR)+" No es multiplo de 5"
        END AS resultado;
        SET @local_num = @local_num + 1;
        CONTINUE;
        PRINT "Este mensaje no deberia imprimirse";
    END;
END;

ALTER TABLE personas DROP COLUMN sexo;
ALTER TABLE personas RENAME COLUMN check TO verdadero_falso;

/*Resultado SELECT
| nombre    | edad | estatura    | nacimiento | verdadero_falso |
| --------- | ---- | ----------- | ---------- | --------------- |
| persona10 | 100  | 6.15000000  | 2010-01-10 | true            |
| persona11 | 111  | 6.76500000  | 2010-01-11 | false           |
| persona12 | 122  | 7.38000000  | 2010-01-12 | true            |
| persona13 | 133  | 7.99500000  | 2010-01-13 | false           |
| persona14 | 144  | 8.61000000  | 2010-01-14 | true            |
| persona15 | 150  | 9.22500000  | 2010-01-15 | false           |
| persona16 | 161  | 9.84000000  | 2010-01-16 | true            |
| persona17 | 172  | 10.45500000 | 2010-01-17 | false           |
| persona18 | 183  | 11.07000000 | 2010-01-18 | true            |
| persona19 | 194  | 11.68500000 | 2010-01-19 | false           |
| persona20 | 200  | 12.30000000 | 2010-01-20 | true            |
| persona21 | 211  | 12.91500000 | 2010-01-21 | false           |
| persona22 | 222  | 13.53000000 | 2010-01-22 | true            |
| persona23 | 233  | 14.14500000 | 2010-01-23 | false           |
| persona24 | 244  | 14.76000000 | 2010-01-24 | true            |
| persona25 | 250  | 15.37500000 | 2010-01-25 | false           |
*/
SELECT * FROM personas;

UPDATE personas SET verdadero_falso = false WHERE edad <= 200 AND verdadero_falso = true;
DELETE FROM personas WHERE nombre = "persona10" OR nombre = "persona20";

/*Resultado SELECT
| Nombre en mayus | booleano |
| --------------- | -------- |
| PERSONA11       | false    |
| PERSONA12       | false    |
| PERSONA13       | false    |
| PERSONA14       | false    |
| PERSONA15       | false    |
| PERSONA16       | false    |
| PERSONA17       | false    |
| PERSONA18       | false    |
| PERSONA19       | false    |
| PERSONA21       | false    |
| PERSONA22       | true     |
| PERSONA23       | false    |
| PERSONA24       | true     |
| PERSONA25       | false    |
*/
SELECT
    UPPER(nombre) AS "Nombre en mayus",
    verdadero_falso AS booleano
FROM personas;

TRUNCATE TABLE personas;
-- Añadir una nueva columna
ALTER TABLE personas ADD nueva_col VARCHAR;
-- Insertar valores solo en algunas columnas
INSERT INTO personas (nueva_col, nacimiento)
VALUES ( "Nuevo valor", 1999-12-24);
INSERT INTO personas (nueva_col, nacimiento)
VALUES ( "hola", 1999-12-25);
INSERT INTO personas (nueva_col, nacimiento)
VALUES ( "Adios", 1999-12-26);

/*Resultado SELECT
| nombre | edad | estatura | nacimiento | verdadero_falso | nueva_col   |
| ------ | ---- | -------- | ---------- | --------------- | ----------- |
| null   | null | null     | 1999-12-24 | null            | Nuevo valor |
| null   | null | null     | 1999-12-25 | null            | hola        |
| null   | null | null     | 1999-12-26 | null            | Adios       |
*/
SELECT * from personas;

DELETE FROM personas WHERE nacimiento != 1999-12-26;

/*Resultado SELECT
| nombre | edad | estatura | nacimiento | verdadero_falso | nueva_col |
| ------ | ---- | -------- | ---------- | --------------- | --------- |
| null   | null | null     | 1999-12-26 | null            | Adios     |
*/
SELECT * from personas;

BEGIN
    DECLARE @num DOUBLE DEFAULT 3.513789141;
    DECLARE @string VARCHAR DEFAULT "\\Hola, mundo!\\";
    PRINT "Número original: " + CAST(@num AS VARCHAR);
    PRINT "String original: " + @string;
    PRINT "Tamaño de string: " + CAST(LEN(@string) AS VARCHAR);
    PRINT "String en minusculas: " + LOWER(@STRING);
    PRINT "String en mayusculas: " + UPPER(@sTRing);
    --PRINT "Redondear numero: " + CAST(ROUND(@num) AS VARCHAR);
    PRINT "Tipo de dato después de redondear: " + TYPEOF(ROUND(@num));
    PRINT "Redondear numero a 3 decimales: " + CAST(ROUND(@num, 3) AS VARCHAR);
    --PRINT "Truncar número: "+CAST(TRUNCATE(@num) AS VARCHAR);
    PRINT "Truncar número a 3 decimales: "+CAST(TRUNCATE(@num, 3) AS VARCHAR);
END;

CREATE PROCEDURE print_together
    @str1 VARCHAR,
    @str2 VARCHAR,
    @separator VARCHAR
AS
BEGIN
    print @str1 + @separator + @str2;
END;

/* Si no te funciona recursivo,
paniquea */
CREATE FUNCTION _factorial(@num INT)
RETURNS INT
BEGIN
    IF @num = 0 THEN
        RETURN 1;
    END IF;
    RETURN @num * _factorial(@num-1);
END;

CREATE PROCEDURE factorial_de_5
AS
BEGIN
    print "5! es: "+CAST(_factorial(5) AS VARCHAR);
END;

CALL print_together("Hola","Adios", ", ");
CALL print_together("Cadena1","Cadena2", ", ");
SELECT _factorial(4) AS "4!";
CALL factorial_de_5();

BEGIN
    DECLARE @mensaje VARCHAR;
    SET @mensaje = "\t\\Este es el \"fin\" de el \'Archivo\'\\\n";
    -- Select para imprimir expresiones
    SELECT
        CAST(-3.1416 * 2 AS VARCHAR) AS "Solo una operación más",
        not true AS "True negado",
        not false AS "False negado"
    ;
    PrInT @MenSAje;
END;

/*Comentario al
final de el archivo*/

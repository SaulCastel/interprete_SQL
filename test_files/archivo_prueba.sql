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
SELECT * FROM personas;

BEGIN
    DECLARE @local_num INT DEFAULT 0;
    /*
    Veamos si el programa
    truena con el WHILE
    */
    WHILE @local_num < 10
    BEGIN
        SET @local_num = @local_num + 1;
        CASE @local_num
            WHEN @local_num % 5 = 0 THEN "Es multiplo de 5"
            ELSE "No es multiplo de 5"
        END AS resultado;
        CONTINUE;
        PRINT "Este mensaje no deberia imprimirse";
    END;
END;

ALTER TABLE personas DROP COLUMN sexo;
ALTER TABLE personas RENAME COLUMN check TO verdadero_falso;
SELECT * FROM personas;
UPDATE personas SET verdadero_falso = false WHERE edad <= 200 AND verdadero_falso = true;
DELETE FROM personas WHERE nombre = "persona10" OR nombre = "persona20";
-- Solo mostrar algunas columnas
SELECT
    nombre AS "Nombre de la persona",
    edad AS edad_de_persona,
    verdadero_falso AS booleano
FROM personas;
TRUNCATE TABLE personas;
-- Añadir una nueva columna
ALTER TABLE personas ADD nueva_col VARCHAR;
-- Insertar valores solo en algunas columnas
INSERT INTO personas (nueva_col, nacimiento)
VALUES
(
    "Nuevo valor",
    1999-12-24
);
SELECT * from personas;
BEGIN
    DECLARE @mensaje VARCHAR;
    SET @mensaje = "\t\\Este es el \"fin\" de el \'Archivo\'\\\n";
    -- Select para imprimir expresiones
    SELECT
        CAST(3.1416 * 2 AS VARCHAR) AS "Solo una operación más",
        @mensaje AS "Mensaje de despedida";
END;

/*Comentario al
final de el archivo*/

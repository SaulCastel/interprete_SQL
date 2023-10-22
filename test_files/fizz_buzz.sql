CREATE TABLE fizzbuzz (
    indice INT,
    numero VARCHAR
);
BEGIN
    FOR i IN 0..30
    BEGIN
        DECLARE @result VARCHAR DEFAULT "";
        IF i % 3 = 0 THEN
            SET @result = @result + "fizz";
        END IF;
        IF i % 5 = 0 THEN
            SET @result = @result + "buzz";
        END IF;
        IF @result = "" THEN
            SET @result = CAST(i AS VARCHAR);
        END IF;
        INSERT INTO fizzbuzz (indice, numero) VALUES (i, @result);
    END;
END;
SELECT indice, numero as "Fizzbuzz con IFs" FROM fizzbuzz;
PRINT "\nFizzbuzz con CASE buscado:\n";
BEGIN
    FOR i IN 0..30
    BEGIN
        CASE i
            WHEN i % 3 = 0 AND i % 5 = 0 THEN "fizzbuzz"
            WHEN i % 3 = 0 THEN "fizz"
            WHEN i % 5 = 0 THEN "buzz"
            ELSE CAST(i AS VARCHAR)
        END AS "resultado";
    END;
END;

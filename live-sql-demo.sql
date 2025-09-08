CREATE OR REPLACE PROCEDURE AutoMatchItems IS
BEGIN
    FOR lost_rec IN (
        SELECT * FROM Lost_Items
        WHERE status = 'Pending'
    ) LOOP
        FOR found_rec IN (
            SELECT * FROM Found_Items
            WHERE status = 'Pending'
              AND item_name = lost_rec.item_name
              AND category = lost_rec.category
              AND found_location = lost_rec.lost_location
        ) LOOP
            -- Insert into Matches table
            INSERT INTO Matches (lost_id, found_id, match_date, status)
            VALUES (lost_rec.lost_id, found_rec.found_id, SYSDATE, 'Confirmed');

            -- Update status of matched lost item
            UPDATE Lost_Items
            SET status = 'Matched'
            WHERE lost_id = lost_rec.lost_id;

            -- Update status of matched found item
            UPDATE Found_Items
            SET status = 'Matched'
            WHERE found_id = found_rec.found_id;

            -- Exit inner loop after first match
            EXIT;
        END LOOP;
    END LOOP;

    SELECT * FROM MATCHES;
END;
/

BEGIN
    AUTOMATCHITEMS;
END;
/

SELECT * FROM MATCHES;
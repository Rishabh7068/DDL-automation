
-- ============================
-- CREATE TABLE
-- ============================

CREATE TABLE customer (
    customer_id       INT AUTO_INCREMENT,
    first_name        VARCHAR(50) NOT NULL,
    last              VARCHAR(50) NOT NULL,
    gender            VARCHAR(10),
    date_of_birth     DATE,
    email             VARCHAR(100),
    phone_number      VARCHAR(20),
    address_line1     VARCHAR(150),
    address_line2     VARCHAR(150),
    city              VARCHAR(100),
    state             VARCHAR(100),
    postal_code       VARCHAR(20),
    country           VARCHAR(100),
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT          pk_customer         PRIMARY KEY     (customer_id ,dsadas),CONSTRAINT      uq_customer_email       UNIQUE KEY (email ,asdsada),key  uq_customer_email  (country ,adsada),
    PRIMARY KEY (id),
    UNIQUE (email)
    
    
    );
    
-- ============================
-- INDEXES AND UNIQUE INDEXES
-- ============================

-- Normal index
CREATE INDEX idx_customer_city      ON       customer (city);

-- Composite index
CREATE INDEX idx_customer_city_state ON        customer (       city,        state);

-- Unique index
CREATE UNIQUE INDEX idx_unique_phone ON customer (phone_number);

-- ============================
-- ALTER TABLE EXAMPLES
-- (ADD, MODIFY, CHANGE, DROP)
-- ============================

-- ADD column
ALTER TABLE customer
ADD middle_name VARCHAR(50);

ALTER TABLE table_name ADD column_name datatype;
ALTER TABLE table_name ADD COLUMN column_name datatype FIRST;
ALTER TABLE table_name ADD COLUMN column_name datatype AFTER phone_number;

-- MODIFY column (same name)
ALTER TABLE customer
MODIFY phone_number VARCHAR(30);
ALTER TABLE table_name MODIFY column_name new_datatype;
-- CHANGE column (rename + modify)
ALTER TABLE customer
CHANGE last last_name VARCHAR(50) NOT NULL;
ALTER TABLE table_name CHANGE old_column new_column new_datatype;

-- DROP column
ALTER TABLE customer DROP address_line2;

ALTER TABLE table_name DROP column_name;

ALTER TABLE table_name RENAME COLUMN old_name TO new_name;



















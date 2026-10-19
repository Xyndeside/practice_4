CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  login         VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(150) NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  email         VARCHAR(150) NOT NULL,
  role          VARCHAR(10)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rooms (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(100) NOT NULL UNIQUE,
  type     VARCHAR(30)  NOT NULL,          -- Аудитория | Коворкинг | Кинозал
  capacity INT          NOT NULL CHECK (capacity > 0)
);

CREATE TABLE IF NOT EXISTS bookings (
  id             SERIAL PRIMARY KEY,
  user_id        INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id        INT         NOT NULL REFERENCES rooms(id),
  start_date     DATE        NOT NULL,
  payment_method VARCHAR(10) NOT NULL CHECK (payment_method IN ('onsite', 'sbp')),
  status         VARCHAR(40) NOT NULL DEFAULT 'Новая'
                 CHECK (status IN ('Новая', 'Мероприятие назначено', 'Завершено')),
  created_at     TIMESTAMP   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bookings_user   ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

CREATE TABLE IF NOT EXISTS reviews (
  id         SERIAL PRIMARY KEY,
  booking_id INT      NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text       TEXT     NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

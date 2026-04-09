import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
const cookieParser = require("cookie-parser");

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  const whitelist = Array.isArray(clientOrigin) ? clientOrigin : [clientOrigin];

  app.enableCors({
    origin: (origin, callback) => {
      // allow non-browser requests like curl (no origin)
      if (!origin) return callback(null, true);
      if (whitelist.indexOf(origin) !== -1) return callback(null, true);
      return callback(new Error("CORS not allowed by server"));
    },
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "User-Agent",
      "DNT",
      "Cache-Control",
      "X-Requested-With",
    ],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false } as any),
  );
  app.enableShutdownHooks();
  app.setGlobalPrefix("api");
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap();

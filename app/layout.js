import "./globals.css";

export const metadata = {
  title: "GoldOro — Златни бижута",
  description:
    "Онлайн магазин за златни гривни, пръстени, ланци и обеци. Проба 585°, 750° и 916°.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,600&family=PT+Sans:wght@400;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

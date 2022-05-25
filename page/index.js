const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.resolve()));

app.all('*', (req, res) => {
    res.send(`<!doctype html>
<html>
    <head>
        <title>öreb.ch</title>
        <meta charset="utf8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <style>

            body {
                padding: 3rem;
                margin: 0;

                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            }

            h1 {
                margin: 0;
                margin-bottom: 1rem;
                padding-left: 3.5rem;
                
                background: url('icon.svg');
                background-size: contain;
                background-repeat: no-repeat;
            }

            p {
                line-height: 1.5;
            }

            a {
                display: inline-block;
                margin-bottom: 2rem;
                padding: 0.75rem 1.5rem;

                border: 2px solid #000;
                text-decoration: none;
                color: black;
                background: #fcf761;

                transition: 0.25s;
            }

            a:hover {
                background: #000;
                color: #fcf761;
            }

            a:after {
                content: '→';

                padding-left: 0.75rem;
            }

            section {
                display: flex;
                flex-wrap: wrap;
            }

            img {
                width: 50%;
            }

            footer {
                margin-top: 3rem;

                font-size: 0.75rem;
            }

            @media (max-width: 50rem) {
                body {
                    padding: 1.5rem;
                }

                img {
                    width: 100%;
                }
            }

        </style>
    </head>

    <body>
        <h1>öreb.ch</h1>

        <p>
            öreb.ch ist ein gratis plugin für luucy, mit dem der öffentlich rechtliche baukataster und die dazugehörigen informationen der grundstücke direkt auf der interaktiven karte angesehen werden können.
            die daten für die darstellung stammen direkt vom bund.
            alle angaben ohne gewähr - melden sie sich bei fehlern an die behörden, welche in den informationen der grundstücke vermerkt sind.
        </p>

        <a href="https://luucy.ch/marketplace/170" target="_blank">
            im luucy marketplace ansehen
        </a>

        <section>
            <img src="map.png" />
            <img src="shape.png" />
            <img src="info.png" />
            <img src="pdf.png" />
            <img src="geojson.png" />
        </section>

        <footer>
            © acryps / vlvt.in gmbh. wir sammeln keine daten über die verwendung dieses plugins oder dieser webseite.
        </footer>
    </body>
</html>`);
});

setTimeout(() => {
    app.listen(process.env.PORT || 1236, () => {
        console.log(`öreb.ch started on ${process.env.PORT}`);
    });
}, 1000 * 30);

export class Service {
    static map = {
        url: 'https://wmscache1001.luucy.ch',
        layer: 'ch_basemap_tlm_av_3',
        parameters: {
            tiled: true,
            format: 'image/png',
            transparent: true
        }
    }

    static api = 'https://api3.geo.admin.ch/';

    static async fetch(pickedPosition: GlobalPosition) {
        const lv95 = pickedPosition.toLV95();
        const x = lv95.east;
        const y = lv95.north;

        const data = await new web.Request(`${this.api}/rest/services/all/MapServer/identify?geometry=${[x, y]}&geometryFormat=geojson&geometryType=esriGeometryPoint&imageDisplay=784,500,96&lang=de&layers=all:ch.swisstopo-vd.stand-oerebkataster&limit=1000&mapExtent=${[x, x, x, x]}&returnGeometry=true&sr=2056&tolerance=1`).get().then(res => res.json());
    
        if (!data.results.length) {
            return;
        }

        const property = data.results[0];

        const polygons: GlobalPosition[][] = [];

        if (property.geometry) {
            for (let coordinates of property.geometry.coordinates) {
                const polygon = [];

                for (let coordinate of coordinates) {
                    // convert position from lv95
                    const position = GlobalPosition.fromLV95(coordinate[0], coordinate[1]);

                    // apply picked positions height for a better area approximation
                    polygon.push(position.copy(0, 0, pickedPosition.height));
                }

                polygons.push(polygon)
            }
        }

        return {
            egrid: property.properties.egris_egrid,
            polygons: polygons,
            municipality: property.properties.gemeindename,
            zip: property.properties.plz,
            pdf: property.properties.oereb_extract_pdf,
            source: property
        }
    }
}
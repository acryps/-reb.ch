import { parcels } from "./plugin";
import { Service } from "./service";

export class Parcel {
    static color = new Color(0xfc, 0xf7, 0x61);

    egrid = '';

    elements: map.ColoredArea[] = [];
    polygons: GlobalPosition[][];

    section: ui.Section;

    edges: map.Marker[] = [];

    constructor(private position: GlobalPosition) {}

    append(container: ui.Container) {
        this.section = new ui.Section('Loading...');
        this.section.createAction(ui.icons.close, 'Remove', () => this.remove());
    
        if (container.children.length) {
            container.insertBefore(this.section, container.children[0]);
        } else {
            container.add(this.section);
        }
    
        this.section.add(new ui.LabeledValue('WSG84', this.position.flattenedCopy().toLocaleString()));
        this.section.add(new ui.LabeledValue('LV95', this.position.toLV95().toString()));
        this.section.add(new ui.LabeledValue('LV03', this.position.toLV03().toString()));
        this.section.add(new ui.Separator());
    
        const loading = new ui.Label('Loading...');
        this.section.add(loading);

        Service.fetch(this.position).then(parcel => {
            loading.hide();

            this.egrid = parcel.egrid;

            if (!parcel) {
                this.section.add(new ui.Label('No results found!'));
    
                return;
            }

            this.polygons = parcel.polygons;

            for (let polygon of parcel.polygons) {
                this.elements.push(new map.ColoredArea(polygon, Parcel.color.copy(0.3), Parcel.color));
            }

            this.section.name = parcel.egrid;

            let area = 0;
            let length = 0;

            for (let polygon of parcel.polygons) {
                area += GlobalPosition.area(polygon);
                length += polygon.length;
            }

            this.section.add(new ui.LabeledValue('EGIRD', parcel.egrid));
            this.section.add(new ui.LabeledValue('Area', area.toMetricAreaString()));
            this.section.add(new ui.LabeledValue('Municipality', `${parcel.municipality} (${parcel.zip})`));

            const edgesCheckbox = new ui.Checkbox(`Show Edges (${length} Points)`, false);
            edgesCheckbox.onValueChange.subscribe(() => {
                if (edgesCheckbox.value) {
                    for (let polygon of this.polygons) {
                        for (let point of polygon) {
                            this.edges.push(new map.Marker(point.flattenedCopy(), Parcel.color));
                        } 
                    }
                } else {
                    for (let edge of this.edges) {
                        edge.remove();
                    }

                    this.edges = [];
                }
            });

            this.section.add(edgesCheckbox);

            this.section.add(new ui.Button('View All Details', () => {
                const modal = new ui.Modal(`${parcel.egrid} Properties`);

                for (let key of Object.keys(parcel.source.properties).sort()) {
                    modal.add(new ui.LabeledValue(key.split('_').join(' ').toUpperCase(), parcel.source.properties[key]));
                }

                modal.open();
            }));

            this.section.add(new ui.Button('Export As GeoJSON', () => {
                const file = File.fromString(`${parcel.egrid}.geojson`, JSON.stringify(this.toGeoJson(), null, '\t'));

                ui.download(file);
            }));

            if (parcel.pdf) {
                this.section.add(new ui.LinkButton('Download Report', parcel.pdf));
            }

            this.section.add(new ui.Button('Add as Shape', async () => {
                for (let element of this.elements) {
                    await element.releaseToVariant(`Parcel ${this.egrid}`);
                }

                this.elements = [];
            }));
        });
    }

    remove() {
        this.section.parent.remove(this.section);
    
        for (let element of this.elements) {
            element.remove();
        }

        parcels.splice(parcels.indexOf(this), 1);
    }

    toGeoJson() {
        return { 
            type: 'Polygon',
            coordinates: this.polygons.map(polygon => polygon.map(position => [position.longitude, position.latitude]))
        }
    }
}
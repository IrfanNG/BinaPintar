import EXIF from 'exif-js';

export interface ImageMetadata {
    latitude?: number;
    longitude?: number;
    timestamp?: string;
    device?: string;
}

export function extractImageMetadata(file: File): Promise<ImageMetadata> {
    return new Promise((resolve, reject) => {
        // Check if the file is an image
        if (!file.type.startsWith('image/')) {
            resolve({});
            return;
        }

        try {
            EXIF.getData(file as any, function (this: any) {
                const metadata: ImageMetadata = {};

                // Extract GPS
                const lat = EXIF.getTag(this, 'GPSLatitude');
                const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
                const long = EXIF.getTag(this, 'GPSLongitude');
                const longRef = EXIF.getTag(this, 'GPSLongitudeRef');

                if (lat && latRef && long && longRef) {
                    metadata.latitude = convertDMSToDD(lat, latRef);
                    metadata.longitude = convertDMSToDD(long, longRef);
                }

                // Extract Timestamp
                const dateTime = EXIF.getTag(this, 'DateTimeOriginal') || EXIF.getTag(this, 'DateTime');
                if (dateTime) {
                    // EXIF format is "YYYY:MM:DD HH:MM:SS" -> convert to ISO
                    const [datePart, timePart] = dateTime.split(' ');
                    const [year, month, day] = datePart.split(':');
                    metadata.timestamp = `${year}-${month}-${day}T${timePart}`;
                }

                // Extract Device Model
                const make = EXIF.getTag(this, 'Make');
                const model = EXIF.getTag(this, 'Model');
                if (make || model) {
                    metadata.device = `${make || ''} ${model || ''}`.trim();
                }

                resolve(metadata);
            });
        } catch (error) {
            console.error('Error extracting EXIF data:', error);
            resolve({}); // Resolve empty if extraction fails
        }
    });
}

function convertDMSToDD(dms: number[], ref: string): number {
    let dd = dms[0] + dms[1] / 60 + dms[2] / 3600;
    if (ref === 'S' || ref === 'W') {
        dd = dd * -1;
    }
    return dd;
}


const Lightbox = [
    'LightboxProvider',

    LightboxProvider => {
        LightboxProvider.getImageUrl = media => {
            // if video, replace .mov with .mp4 so we can play with native HTML5 (for Cloudinary)
            if (media.type === 'video' && media.URL.indexOf('.mov') === media.URL.length - 4) {
                media.URL = media.URL.substring(0, media.URL.length - 4) + '.mp4'
            }

            return media.URL
        }

        LightboxProvider.getImageCaption = media => null
    }
]

export default Lightbox

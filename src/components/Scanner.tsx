import { useEffect, useRef } from "react";
import jsQR from "jsqr";

function Scanner() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        let scanning = false;

        function QRScanner() {
            if (scanning) return;

            scanning = true;
            ctx?.drawImage(video!, 0, 0, canvas!.width, canvas!.height);

            try {
                const imageData = ctx?.getImageData(0, 0, canvas!.width, canvas!.height);
                const code = jsQR(imageData!.data, imageData!.width, imageData!.height);
                if (code) {
                    console.log("QR code detected: ", code.data);
                    window.location.href = code.data;
                }
            } catch (error) {
                console.error(error);
            }

            scanning = false;
            requestAnimationFrame(QRScanner);
        }

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then((stream) => {
                video!.srcObject = stream;
                video!.play();
                requestAnimationFrame(QRScanner);
            })
            .catch((error) => {
                console.error(error);
            });

        return () => {
            if (video?.srcObject) {
                const stream = video!.srcObject as MediaStream;
                const tracks = stream.getTracks();
                tracks.forEach((track) => {
                    track.stop();
                });
                video.srcObject = null;
            }
        };
    }, []);

    return (
        <div>
            <video ref={videoRef} width="640" height="480" />
            <canvas ref={canvasRef} width="640" height="480" style={{ display: "none" }} />
        </div>
    );
}

export default Scanner;

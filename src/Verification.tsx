import { useEffect, useState } from "preact/hooks";
import { WebVerification } from "vdid-sdk-web";
import warning from "./assets/warning_suma.webp";

export const Verification = () => {
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  //Iniciar la instancia de la verificación
  const vdid = new WebVerification(
    "<<pk_test_public_key>>", // Reemplazar por la llave pública
  );

  const createVerification = async () => {
    setLoading(true);
    setError("");

    // Llamada al endpoint para la creación de una nueva verificación
    const response = await fetch(
      "https://veridocid.azure-api.net/api/id/v3/createVerification",
      {
        method: "POST",
        headers: {
          "x-api-key": "<<sk_test_private_key>>", // Reemplazar por la llave privada
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "demo_sdk_01.20.01.2026", //Identificador de la verificación
          options: {
            checks: {
              selfie: true, // Si se coloca el valor false se omite los pasos de la captura de la selfie
              onlyVerifyID: false, // Si se colocar el valor true se omite la opción de pasaporte
            },
          },
        }),
      },
    );

    if (response.ok) {
      setLoading(false);
      const uuid = await response.text();

      // Obtención de la URL para iniciar el proceso de verificación, esta URL se debe implementar en el iframe
      const url = vdid.getUrl({ uuid });

      if (url) setUrl(url);
    } else {
      setLoading(false);
      const error = await response.json();

      if (error) {
        if (error?.error?.message) {
          const getError = error?.error;
          if (Array.isArray(getError.message)) {
            setError(getError.message[0]);
          } else {
            setError(getError.message);
          }
        } else {
          setError(
            "Hubo un error al crear una verificación. Intente nuevamente más tarde.",
          );
        }
        setUrl("");
      }
    }
  };


  // Escucha de mensajes enviados desde el iframe, en este caso se espera una respuesta con la propiedad completed en true para indicar que el proceso de verificación ha finalizado
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Información enviada desde el iframe
      const data = event.data;

      // Respuesta: { completed: true }
      if (data?.completed) console.log(data);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <>
      {error ? (
        <div className="verification_error">
          <p>{error}</p>
          <h3>Error en la creación de la verificación</h3>
          <img src={warning} alt="warning" width={"120px"} />
        </div>
      ) : (
        <iframe
          id="verification_iframe"
          src={url}
          allow="camera; microphone;"
          title="Verificación"
        />
      )}

      <div className="content_btns">
        <button
          type="button"
          className="btn_start_process"
          onClick={createVerification}
          disabled={loading}
        >
          <span>{loading ? "Cargando..." : "Crear verificación"}</span>
        </button>
      </div>
    </>
  );
};

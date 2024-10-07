import { useEffect, useRef, useState } from "react";
import "./pdfReader_copy.scss";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import PDFViewer from "../../components/PDFViewer/PDFViewer.js"
import { pdfjs } from 'react-pdf';


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.mjs`;



const PdfReader_copy = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [progress, setProgress] = useState(0); 
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false); 
  const [fileUris, setFileUris] = useState([]);
  const [summary, setSummary] = useState("");
  const [isGeneratedResponse, setIsGeneratedResponse] = useState(false);
  const [uploadedFileNames, setUploadedFileNames] = useState([]);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(""); 

  const hiddenFileInput = useRef(null);
  
  useEffect(() => {
    const rightPanel = document.querySelector(".right");
    const centerContainer = document.querySelector(".center_container");
    const a = document.querySelector(".a");
    const ai = document.querySelector(".ai");
    const id = document.querySelector(".id");
    const d = document.querySelector(".d");

    if (rightPanel && centerContainer) {
      // Funkcja na hover dla elementu "right"
      rightPanel.addEventListener("mouseenter", () => {
        centerContainer.style.width = "calc(100% * 1 / 6)";
        rightPanel.style.width = "calc(100% * 2 / 6)";
        a.style.width = "100%";
        ai.style.left = "100%";
        id.style.width = "50%";
        d.style.width = "50%";
        d.style.left = "50%";
      });

      rightPanel.addEventListener("mouseleave", () => {
        centerContainer.style.width = "calc(100% * 2 / 6)";
        rightPanel.style.width = "calc(100% * 1 / 6)";
        a.style.width = "50%";
        ai.style.left = "50%";
        id.style.width = 0;
        d.style.width = "100%";
        d.style.left = 0;
      });

      return () => {
        rightPanel.removeEventListener("mouseenter", null);
        rightPanel.removeEventListener("mouseleave", null);
      };
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    handleUpload(selectedFiles); // Automatycznie uploaduj plik
  };

  // Automatyczne uploadowanie plików
  const handleUpload = async (selectedFiles) => {
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    setLoading(true); // Włącz pasek postępu
    setProgress(0); // Resetuj postęp

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:8800/api/upload/", true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          console.log("Odpowiedź serwera:", result); // <== Dodaj ten log
          
          setSelectedPdfUrl(result.files[0].fileUri);

          const fileUri = result.files[0].fileUri;
          console.log("Loaded PDF URL:", fileUri);

          setFileUris(result.files.map((file) => file.fileUri));
          setUploadedFileNames(result.files.map((file) => file.fileName));
          setProgress(100); // Ustaw 100% po zakończeniu
          setIsFileUploaded(true); // Plik został załadowany
          // handleAnalyze(result.files.map((file) => file.fileUri)); // Analiza AI
        } else {
          console.error("Error uploading files:", xhr.statusText);
        }
        setLoading(false);
      };

      xhr.onerror = () => {
        console.error("Network Error");
        setLoading(false);
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Error uploading files:", error);
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoadingSummary(true);
    const response = await fetch("http://localhost:8800/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileUris,
        prompt: `Odpowiedz na pytanie: ${prompt}. Proszę sformatować odpowiedź w HTML z użyciem <h1>, <h2>, <p>, <blockquote> oraz <ul><li> dla list.`,
      }),
    });

    const result = await response.json();
    setSummary(result.summary);
    setIsGeneratedResponse(true); // Ustawiamy, że odpowiedź została wygenerowana
    setLoadingSummary(false); // Wyłączamy loader po zakończeniu
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };
  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  const handlePdfSelection = (pdfUri) => {

    setSelectedPdfUrl(pdfUri); 
  };

  

  return (
    <div className="reader-container">
      {/* Panel lewy */}
      <div className="left">
        <div className="head">
          <div className="left_head t">T</div>
          <div className="left_head e">E</div>
          <div className="left_head x">X</div>
        </div>
        <div className="content-container">
          <div className="bottom-panel">
            <button className="mini-upload-button" onClick={handleClick}>
              <AttachFileIcon />
            </button>

            {loading && (
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${progress}%`, // Nadal kontrolujemy szerokość paska za pomocą stanu
                  }}
                />
              </div>
            )}

            {/* Ukryty input do wyboru pliku */}
            <input
              type="file"
              accept="application/pdf"
              multiple
              ref={hiddenFileInput}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            <textarea
              value={prompt}
              onChange={handlePromptChange}
              placeholder="Enter your prompt here"
              rows="2"
            />

            <button className="send" onClick={handleGenerate}>
              <ArrowUpwardIcon />
            </button>

            {uploadedFileNames.length > 0 && (
              <div className="file-links">
                {uploadedFileNames.map((fileName, index) => (
                  <button
                    key={index}
                    onClick={() => handlePdfSelection(fileUris[index])}
                  >
                    {fileName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Komponent PDFViewer */}
          {fileUris.length > 0 && <PDFViewer fileUris={fileUris} />}
          
        </div>
      </div>

      {/* Panel centralny */}
      <div className="center_container">
        <div className="center">
          <div className="head">
            <div className="center_head a">A</div>
            <div className="center_head ai">I</div>
          </div>
        </div>
        <div className="content-container">
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos
            nisi debitis magni quod vel. Sequi expedita earum necessitatibus
            libero sed? Impedit, tempora sunt cupiditate adipisci magnam,
            consequatur quia enim, explicabo eaque minima est commodi illum quo
            cumque sequi deserunt provident optio! Accusamus, sapiente explicabo
            in voluptatibus provident, quidem debitis autem ratione quisquam
            adipisci perspiciatis pariatur, quis recusandae repellendus? Aperiam
            tempore illum culpa fugit, unde rem, hic, exercitationem pariatur
            repudiandae numquam repellendus dolores. Maiores ab natus est
            asperiores vero autem minima veniam voluptates totam ullam, odit
            impedit blanditiis? Molestias provident, distinctio error mollitia
            accusantium nam excepturi aspernatur odit dolores dolorem non quam
            facilis labore odio officiis placeat voluptas fugiat repellendus hic
            perspiciatis corporis assumenda ratione in. Voluptatibus ut iure,
            quos harum ratione iusto quaerat maiores exercitationem numquam.
            Molestiae voluptates nostrum mollitia aspernatur dolores unde facere
            incidunt eveniet suscipit, impedit temporibus esse animi quam iste
            consequatur quia, libero aperiam error repudiandae corrupti quaerat
            totam minima! Laboriosam minus exercitationem dolor maiores beatae
            perspiciatis repudiandae vel harum aliquam labore. Ipsam aut
            consequatur unde est, tempore numquam obcaecati rem saepe odit
            aliquid expedita, alias accusamus ducimus voluptates explicabo
            repellendus ex qui, debitis suscipit odio iste aperiam a. Voluptate
            atque at a maiores quo. Maxime autem expedita quam aperiam explicabo
            soluta sint dicta dolores, reprehenderit ratione aut iusto dolorum
            ut laudantium a debitis rerum tenetur aliquid illum beatae tempora
            assumenda eaque. Ex esse, magnam sequi illo, explicabo officia
            laudantium optio amet, consectetur quasi perferendis consequatur
            recusandae enim dolor autem facere dicta tempora placeat quod! Earum
            odio fugiat maxime reiciendis non deserunt excepturi voluptatum
            officia illum odit aut, tempore sit nulla! Praesentium tempore ullam
            sed animi, dolorum nisi quas libero iure quos quidem alias
            reiciendis laboriosam blanditiis ea, officiis explicabo possimus
            delectus excepturi minima! Qui fuga itaque labore. At quod eius
            necessitatibus optio consectetur ad excepturi. Rem modi ipsum, aut
            vitae beatae error? Qui earum odit excepturi recusandae cumque
            provident numquam tempore fuga repellendus, quia id vero quis
            praesentium. Perferendis natus labore amet soluta ab quae veniam
            tenetur optio obcaecati ullam quidem eligendi molestias unde commodi
            earum minus atque, quod error? Hic, voluptates labore quos excepturi
            ea blanditiis minus nihil rerum eos pariatur, ad nostrum impedit? Ex
            dignissimos ipsa amet error expedita ipsam, blanditiis laudantium,
            adipisci ad doloribus modi ratione magni vitae reiciendis odit et
            soluta. Doloribus sed voluptates cupiditate minima ipsa pariatur
            incidunt nostrum modi, voluptate optio odio nam iusto est
            accusantium voluptatum sapiente non perferendis. Tenetur deserunt
            expedita nisi minima dignissimos quia delectus! Error nostrum eaque
            reiciendis veniam enim vero aliquam tenetur sint quas tempora quam
            eveniet quae exercitationem voluptate delectus minima, explicabo
            laudantium ullam unde officiis. Dolorem pariatur ea accusantium
            eius, aliquid error qui nam culpa esse velit quos repudiandae
            consequatur cupiditate harum corrupti id omnis reiciendis, explicabo
            quam. Impedit atque eos alias quod error veniam cumque reprehenderit
            nisi, maiores voluptates cum hic suscipit libero corrupti distinctio
            quasi dolores voluptate illum assumenda provident sapiente saepe.
            Delectus culpa, laboriosam ipsam nam aliquid doloremque temporibus
            dolores dicta iusto fugiat, quibusdam eligendi. Dignissimos tenetur
            quisquam pariatur repellat quia aliquam dolore deleniti deserunt?
            Repellat, culpa, iusto voluptatibus sit similique maiores incidunt
            vero tempore doloremque repudiandae magnam quisquam ipsa sequi
            laborum sapiente totam tempora explicabo ex sunt expedita
            accusantium hic commodi eius! Quidem totam deleniti dolore
            aspernatur maiores. Voluptates laborum libero aliquid distinctio
            consectetur dicta voluptatem, tempore ex labore facere rerum dolore
            nesciunt rem culpa, voluptate amet quia est quos suscipit quisquam
            nemo. Earum vero impedit iusto asperiores expedita ipsum illum
            vitae! Numquam laboriosam, enim vitae accusantium possimus eveniet
            saepe maiores aspernatur a excepturi voluptatum illum blanditiis
            ipsa exercitationem molestiae sed. Deserunt soluta fugit assumenda
            dignissimos ullam sapiente enim, voluptates dicta totam ad
            cupiditate officiis nulla recusandae nisi? Eos expedita cupiditate
            dolore eveniet, ullam quo doloribus rem facere vel suscipit libero
            aspernatur voluptatum velit, labore unde consequatur nulla
            reiciendis nihil excepturi praesentium autem ad sint dignissimos
            voluptas? Tenetur, beatae. Veniam soluta sed sapiente molestias
            incidunt! Et omnis cum maiores, quia porro ipsa debitis aspernatur
            quo expedita placeat provident nostrum delectus, nobis blanditiis
            animi? Adipisci, minus error soluta earum tempora nulla molestias
            nam non dolore? Sunt quaerat maxime, praesentium facere numquam
            soluta mollitia iste, odio dolores possimus excepturi omnis ullam
            neque obcaecati. Sit officiis quaerat corrupti, facilis quasi esse
            culpa a quia veritatis! Ut iure laudantium fugiat explicabo? Quo
            quidem eveniet ipsum. Earum, cupiditate cum voluptate atque debitis
            numquam animi nesciunt tenetur, est molestiae quas? Enim
            consequuntur ad delectus quod placeat fuga quos incidunt rerum
            asperiores quidem blanditiis rem nulla vero iure velit quas commodi,
            amet recusandae. Ipsum corrupti inventore accusamus explicabo
            debitis, harum eum similique delectus distinctio nobis possimus!
            Vitae soluta recusandae corrupti repudiandae blanditiis eum sed quos
            aliquid debitis, ex officia a fuga inventore totam vero architecto
            esse alias nostrum voluptates? Rerum fugiat tempore sint inventore
            enim quod porro dolorem velit, natus repellendus nulla in laborum
            excepturi voluptatem ex est quae neque quo reprehenderit iusto.
            Minima labore fugit dolorum cupiditate quasi illum modi velit aut
            saepe, necessitatibus placeat, repudiandae expedita. Accusamus
            asperiores, architecto ducimus similique impedit cupiditate. Sunt
            atque, non in culpa commodi aliquam amet natus, unde quod voluptates
            quisquam, illum explicabo impedit praesentium minus pariatur
            blanditiis dolore eius perspiciatis! Accusantium libero, itaque
            molestiae corrupti quasi dolorum, tempore nihil ex inventore
            consectetur voluptatum rem minima fugiat architecto eveniet omnis.
            Tempore ex saepe mollitia iure, quasi odio voluptatibus vel optio
            aliquam, eius nemo at minus laboriosam veritatis voluptas illo aut,
            commodi eum quas blanditiis dignissimos. Consectetur quas
            praesentium fugit quos recusandae error dignissimos deserunt
            similique dolores quo officiis perspiciatis adipisci qui perferendis
            quisquam vero amet in, esse non minima iure pariatur quasi. Ipsum
            necessitatibus praesentium perferendis dignissimos quo, consequuntur
            ut magni. Veritatis, reprehenderit. Quam, dolor. Aliquid animi
            eveniet quis maiores architecto voluptates, odit obcaecati quasi
            perferendis, earum minima deserunt. Veritatis commodi impedit aut
            velit sit, nobis at veniam culpa expedita, iusto minus perferendis
            eum unde, ad officiis. Quos, ipsum dolor! Tenetur, magni enim.
            Itaque illum quas ipsa facere esse quia blanditiis aperiam ut,
            eligendi optio at unde. Cum deleniti vero consequatur? Laboriosam
            id, obcaecati repellendus blanditiis maiores at quos.
          </p>{" "}
        </div>
      </div>

      {/* Panel prawy */}
      <div className="right">
        <div className="head">
          <div className="right_head id">I</div>
          <div className="right_head d">D</div>
        </div>
        <div className="content-container">
          <p>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur ex
            iste maxime, laborum illum voluptatibus laboriosam possimus modi
            fugiat earum doloribus cumque officia, provident aspernatur debitis
            corporis unde nihil eligendi quae, necessitatibus et nesciunt
            adipisci. Delectus, assumenda necessitatibus placeat, expedita eaque
            esse voluptatum dolorem, nihil reprehenderit possimus soluta
            pariatur accusantium? Illo id quo dolor dignissimos. Veritatis hic
            sapiente repellendus ipsa, tempora, et temporibus voluptatum omnis
            non minus voluptatibus! Error et voluptatibus repellendus autem
            eligendi suscipit, voluptates tempore maiores corporis eveniet
            numquam tenetur laborum non, atque eius placeat cum nihil, minus
            sint saepe omnis delectus. Cum corrupti laudantium labore et,
            consequatur corporis esse enim molestias, iusto pariatur veritatis
            dolorum repellat officia quis est. Nobis consequuntur laudantium,
            cum deleniti magni voluptates eum placeat dolor illum saepe aliquam
            sequi. Ullam odio labore quasi aut impedit maiores, temporibus, esse
            laboriosam asperiores adipisci harum, explicabo repellendus.
            Voluptas libero iste cumque. Repellendus voluptates, veniam,
            pariatur, blanditiis ipsum odit molestias harum eum in consequatur
            temporibus rem? Iure tempora ad cupiditate rerum quia ipsa laborum
            quibusdam dolore, quidem illum facilis quod alias expedita? Magni,
            temporibus ut laudantium consectetur ullam quaerat aspernatur dolor
            sunt voluptate harum maiores dolores molestias quia aliquid nisi
            voluptas quod non sapiente provident esse sint! Asperiores voluptate
            maiores distinctio laudantium, consectetur, doloribus, velit ratione
            amet non sapiente magnam sequi debitis deleniti ducimus ad iure
            omnis nobis cum hic quo consequuntur? Aspernatur sed voluptatum sunt
            natus velit in. Totam, tenetur! Necessitatibus temporibus debitis
            autem fugiat vero laudantium libero excepturi quo asperiores qui ad
            quibusdam non, odio assumenda repudiandae quia molestiae perferendis
            perspiciatis dicta veritatis minima illum dolorum consequatur.
            Recusandae vero repellat qui ratione illo sint veniam blanditiis?
            Libero vitae, iure, fugiat rem ducimus deserunt repudiandae sed
            officiis repellat dolores beatae dignissimos maxime numquam eaque
            possimus minus. Facere, exercitationem iste, minus vero error
            reiciendis magni culpa assumenda expedita aut corporis debitis,
            autem ipsa soluta. Tempora, non reprehenderit? Quia libero mollitia
            aut dolorem aliquid corporis dicta sit adipisci nesciunt doloremque.
            Possimus enim inventore ducimus magni exercitationem temporibus,
            asperiores fugit quaerat! Illo sapiente sint vero assumenda
            perferendis odit ab possimus animi accusantium dolores, consequatur
            obcaecati quibusdam nihil natus? Perferendis soluta odit iusto
            similique commodi id! Impedit ducimus facilis provident corporis
            itaque molestias odio dolores cum asperiores atque illo adipisci sed
            voluptates dignissimos molestiae autem error ipsum, nostrum
            quibusdam perferendis. Voluptas minima, quas deserunt velit
            voluptates nam vitae quo nulla repellat, ipsam enim? Dignissimos
            nihil delectus aspernatur, et fugit saepe ex esse mollitia dolore ut
            expedita perferendis earum cum blanditiis voluptates, exercitationem
            perspiciatis ducimus, inventore nemo? Sequi repellendus ab
            voluptates deleniti aspernatur doloribus ea sapiente cumque tenetur
            exercitationem repudiandae quae, facere atque labore praesentium,
            porro eius maxime ducimus quaerat. Dicta cupiditate iure nesciunt
            ratione pariatur nobis harum quia recusandae molestias laboriosam?
            Quod saepe veniam corrupti quia, consequatur perferendis porro, id
            inventore vitae fuga nostrum officia quae eveniet dignissimos
            possimus, provident temporibus blanditiis nemo iure aperiam
            doloremque laudantium quo? Totam in quibusdam explicabo, autem,
            reprehenderit natus quod modi voluptate soluta hic obcaecati
            inventore similique possimus, animi impedit quo debitis accusamus
            corrupti.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PdfReader_copy;

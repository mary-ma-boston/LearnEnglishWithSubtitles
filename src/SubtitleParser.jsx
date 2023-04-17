import React, { useState } from "react";
import assParser from "ass-parser";
import "./SubtitleParser.css"

function SubtitleParser() {
  const [subtitles, setSubtitles] = useState([]);
  const [showOnlyChinese, setShowOnlyChinese] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const contents = event.target.result;
      const parsedSubtitles = parseSubtitles(contents);
      setSubtitles(parsedSubtitles);
    };

    reader.readAsText(file);
  };


  const GetParsedEnglishChinese = (strInput) => {
    if( strInput == undefined) return ["", ""]

    const parseRulePair = [
        [/[^\\\{\}]*(?=\\N)/g, /(?<=\})[^\{\}]+$/g], 
        [/(?<=\\N[^{]*?)[^\\{\\}]+(?=\\r|$)/g, /(?<=\})[^\\{\\}]+(?=\{)/g],
        [/[^\{\}]+(?=\{\\r\}$)/g,/(?<=\}).+(?=\{\\r\}\\N)/g]
    ]

    for( let i = 0 ; i < parseRulePair.length; i++)
    {
        const englishRegex = parseRulePair[i][1];
        const englishMatch = strInput.match(englishRegex);

        

        // Regular expression to match Chinese text
        const chineseRegex = parseRulePair[i][0];
        const chineseMatch = strInput.match(chineseRegex);
        if( englishMatch != undefined && englishMatch.length > 0 && chineseMatch != undefined && chineseMatch.length > 0)
        {
            return [englishMatch,chineseMatch]
        }
    }

    return ["", ""]

  }
  const parseSubtitles = (contents) => {
    const parsed = assParser(contents);
    for( let i = 0 ; i < parsed.length; i++)
    {
        if(parsed[i]["section"] == "Events")
        {
            const subtitles = parsed[i].body.map((event) => {
                let testText = event.value.Text
                if ( testText == undefined )
                {
                    return null
                }
                
                let retEngChPair = GetParsedEnglishChinese(testText)
                if( retEngChPair[0] == "" && retEngChPair[1] == "")
                {
                    return null
                }

                let englishMatch = retEngChPair[0]
                let chineseMatch = retEngChPair[1]

                
                return {
                time: event.value.Start,
                english: englishMatch,
                chinese: chineseMatch, // This will be populated later
              }
            });
            
            return subtitles.filter( ele => ele != null );
        }
    }
    
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <br />
      <br />
      <label>
        <input
          type="checkbox"
          checked={showOnlyChinese}
          onChange={(event) => setShowOnlyChinese(event.target.checked)}
        />
        Show only time and Chinese
      </label>
      <br />
      <br />
      <table className="subtitle-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Chinese</th>
            {!showOnlyChinese && <th>English</th>}
          </tr>
        </thead>
        <tbody>
          {subtitles.map((subtitle) => (
            <tr key={subtitle.time}>
              <td>{subtitle.time}</td>
              <td>{subtitle.chinese}</td>
              {!showOnlyChinese && <td>{subtitle.english}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SubtitleParser;

"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Form, Button, Table, Card } from "react-bootstrap";

const Home = () => {
  return (
    <React.Suspense fallback={<h1>Loading...</h1>}>
      <HomeContent />
    </React.Suspense>
  );
};

const HomeContent = () => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const [green, setGreen] = React.useState(searchParams.get("green") || "");
  const [sud, setSud] = React.useState(searchParams.get("sud") || "");
  const [lift, setLift] = React.useState(searchParams.get("lift") || "");
  const [initialBpm, setInitialBpm] = React.useState(searchParams.get("initialBpm") || "");
  const [showTable, setShowTable] = React.useState(false);
  const [validated, setValidated] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const greenNum = Number(green);
  const sudNum = Number(sud);
  const liftNum = Number(lift);
  const initialBpmNum = Number(initialBpm);

  const clamp = (x: number, min: number, max: number) => Math.max(Math.min(x, max), min);

  // g = a / (bpm * hs) * (999 - (sud + lift))
  // hs = a / g / bpm * (999 - (sud + lift))

  const a = 175.3;
  const hs = clamp((a * (999 - (sudNum + liftNum))) / greenNum / initialBpmNum, 0.5, 10);

  const calculateGreen = (bpm: number, gear: number, useSud: boolean = true) =>
    Math.round((a / (bpm * clamp(hs + 0.5 * gear, 0.5, 10))) * (999 - (useSud ? sudNum + liftNum : liftNum)));

  const getBackgroundColor = (value: number) => {
    // #5f9ea0
    const r = 0x5f,
      g = 0x9e,
      b = 0xa0;
    const magnification = 1 - Math.min(Math.abs(Math.log(value / greenNum)) / 1, 1);
    return `rgb(${r * magnification}, ${g * magnification}, ${b * magnification})`;
  };

  const bpms = React.useMemo(() => {
    const result = [];
    for (let i = (initialBpmNum % 10) + 30; i <= 500; i += 10) result.push(i);
    return result;
  }, [initialBpmNum]);
  const gears = React.useMemo(() => {
    const result = [];
    for (let i = -8; i <= 8; i++) result.push(i);
    return result;
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const params = new URLSearchParams(searchParams);
    e.preventDefault();
    if (!form.checkValidity()) {
      e.stopPropagation();
    } else if (sudNum + liftNum >= 1000) {
      setErrorMessage("SUD+ と LIFT の合計は 999 以下にしてください");
      setShowTable(false);
      e.stopPropagation();
    } else {
      console.log("hs", hs);
      setErrorMessage("");
      setShowTable(true);
    }

    if (green) params.set("green", green);
    else params.delete("green");

    if (sud) params.set("sud", sud);
    else params.delete("sud");

    if (lift) params.set("lift", lift);
    else params.delete("lift");

    if (initialBpm) params.set("initialBpm", initialBpm);
    else params.delete("initialBpm");

    replace(`?${params.toString()}`);

    setValidated(true);
  };

  return (
    <div className="wrapper">
      <h1>IIDX ギアチェン計算機</h1>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group className="formGroup">
          <Form.Label>初期緑数字</Form.Label>
          <Form.Control
            required
            type="number"
            defaultValue={searchParams.get("green") || ""}
            min={1}
            max={9999}
            placeholder="例: 270"
            onChange={(e) => (setGreen(e.target.value), setShowTable(false))}
          />
          <Form.Control.Feedback type="invalid">1-9999の間で入力してください</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="formGroup">
          <Form.Label>SUD+ 長さ</Form.Label>
          <Form.Control
            required
            type="number"
            defaultValue={searchParams.get("sud") || ""}
            min={0}
            max={999}
            placeholder="例: 100"
            onChange={(e) => (setSud(e.target.value), setShowTable(false))}
          />
          <Form.Control.Feedback type="invalid">0-999の間で入力してください</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="formGroup">
          <Form.Label>LIFT 高さ</Form.Label>
          <Form.Control
            required
            type="number"
            defaultValue={searchParams.get("lift") || ""}
            min={0}
            max={999}
            placeholder="例: 50"
            onChange={(e) => (setLift(e.target.value), setShowTable(false))}
          />
          <Form.Control.Feedback type="invalid">0-999の間で入力してください</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="formGroup">
          <Form.Label>初期BPM</Form.Label>
          <Form.Control
            required
            type="number"
            defaultValue={searchParams.get("initialBpm") || ""}
            min={1}
            max={999}
            placeholder="例: 120"
            onChange={(e) => (setInitialBpm(e.target.value), setShowTable(false))}
          />
          <Form.Control.Feedback type="invalid">1-999の間で入力してください</Form.Control.Feedback>
        </Form.Group>
        <Button variant="primary" type="submit">
          計算
        </Button>
      </Form>
      {errorMessage && <p className="warn">{errorMessage}</p>}
      <p>
        - : 白鍵 (下げ) <br />+ : 黒鍵 (上げ)
      </p>
      {showTable && (
        <div className="stickyTableWrapper">
          <Table bordered className="stickyTable">
            <thead>
              <tr>
                <th>BPM</th>
                {gears.map((e, i) => (
                  <th key={i} style={{ background: e === 0 ? "gold" : "white" }}>
                    {e > 0 && "+"}
                    {e}個
                  </th>
                ))}
                <th style={{ background: "lightgray" }}>SUD+ 外し</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>(HS)</th>
                {gears.map((gear, i) => (
                  <td key={i}>{clamp(hs + 0.5 * gear, 0.5, 10).toFixed(2)}</td>
                ))}
                <td>{hs.toFixed(2)}</td>
              </tr>
              {bpms.map((bpm, i) => (
                <tr key={i}>
                  <th style={{ background: bpm === initialBpmNum ? "gold" : "white" }}>{bpm}</th>
                  {gears.map((gear, i) => {
                    const changedGreen = calculateGreen(bpm, gear);
                    return (
                      <td key={i} style={{ background: getBackgroundColor(changedGreen), color: "#3E0" }}>
                        {changedGreen}
                      </td>
                    );
                  })}
                  <td style={{ background: getBackgroundColor(calculateGreen(bpm, 0, false)), color: "#3E0" }}>
                    {calculateGreen(bpm, 0, false)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      <Card className="card">
        <Card.Body>
          <h3>注意</h3>
          <ul className="cardList">
            <li>FHS使用時の値です。</li>
            <li>初期緑数字に近いほど表の背景が明るくなります。</li>
            <li>
              緑数字は a = 175.3 として、green = a / (bpm * hs) * (999 - (sud + lift)) という式より計算しています。
            </li>
            <li>計算結果の正確性は保証いたしません。あくまで参考情報としてお使いください。</li>
          </ul>
        </Card.Body>
      </Card>
      <p>
        作者: まーた / <a href="https://github.com/ma-tw/iidx-green">GitHub</a> /{" "}
        <a href="https://x.com/ma_tw">X (Twitter)</a>
      </p>
    </div>
  );
};

export default Home;

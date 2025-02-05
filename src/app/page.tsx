"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Form, Button, Table } from "react-bootstrap";

const Home = () => {
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

  // g = a / (bpm * hs) / (1000 - w)
  // a = g * (bpm * hs) * (1000 - w)
  // hs = a / g / bpm / (1000-w)
  const a = 53064000;
  const hs = a / greenNum / initialBpmNum / (1000 - sudNum - liftNum);

  const clamp = (x: number, min: number, max: number) => Math.max(Math.min(x, max), min);

  const calculateGreen = (bpm: number, gear: number, useSud: boolean = true) =>
    Math.round(
      (a / (bpm * clamp(hs + gear * 0.5, 0.5, 10)) / (1000 - sudNum - liftNum)) *
        (useSud ? 1 : (1000 - liftNum) / (1000 - sudNum - liftNum))
    );

  const getBackgroundColor = (value: number) => {
    // #5f9ea0
    const r = 0x5f, g = 0x9e, b = 0xa0;
    const magnification = 1 - Math.min(Math.abs(Math.log(value / greenNum)) / 1, 1);
    return `rgb(${r * magnification}, ${g * magnification}, ${b * magnification})`;
  };

  const bpms = React.useMemo(() => {
    const result = [];
    for (let i = (initialBpmNum % 10) + 60; i <= 500; i += 10) result.push(i);
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
        <Table bordered responsive>
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
            {bpms.map((bpm, i) => (
              <tr key={i}>
                <th style={{ background: bpm === initialBpmNum ? "gold" : "white" }}>{bpm}</th>
                {gears.map((gear, i) => {
                  const changedGreen = calculateGreen(bpm, gear);
                  return (
                    <td key={i} style={{ background: getBackgroundColor(changedGreen), color: "limegreen" }}>
                      {changedGreen}
                    </td>
                  );
                })}
                <td style={{ background: getBackgroundColor(calculateGreen(bpm, 0, false)), color: "limegreen" }}>
                  {calculateGreen(bpm, 0, false)}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default Home;

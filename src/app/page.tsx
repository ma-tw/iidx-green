"use client";

import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles.module.css";
import { Form, Button } from "react-bootstrap";

const Home = () => {
  const [green, setGreen] = React.useState("");
  const [sud, setSud] = React.useState("");
  const [lift, setLift] = React.useState("");
  const [initialBpm, setInitialBpm] = React.useState("");
  const [table, setTable] = React.useState([[]]);

  // g = a / (bpm * hs) / (1000 - w)
  const a = 53064000;
  const hs = a / Number(green) / Number(initialBpm) / (1000 - Number(sud) - Number(lift))

  return (
    <div style={{ textAlign: "center" }}>
      <h1>IIDX 緑数字計算機</h1>
      <Form.Group className={styles.formGroup}>
        <Form.Label>緑数字</Form.Label>
        <Form.Control
          type="number"
          value={green}
          min={1}
          placeholder="例: 270"
          onChange={(e) => setGreen(e.target.value)}
        />
      </Form.Group>
      <Form.Group className={styles.formGroup}>
        <Form.Label>SUD+ 長さ</Form.Label>
        <Form.Control
          type="number"
          value={sud}
          min={1}
          placeholder="例: 100"
          onChange={(e) => setSud(e.target.value)}
        />
      </Form.Group>
      <Form.Group className={styles.formGroup}>
        <Form.Label>LIFT 高さ</Form.Label>
        <Form.Control
          type="number"
          value={lift}
          min={1}
          placeholder="例: 50"
          onChange={(e) => setLift(e.target.value)}
        />
      </Form.Group>
      <Form.Group className={styles.formGroup}>
        <Form.Label>初期BPM</Form.Label>
        <Form.Control
          type="number"
          value={initialBpm}
          min={1}
          placeholder="例: 120"
          onChange={(e) => setInitialBpm(e.target.value)}
        />
      </Form.Group>
      <Button variant="primary">計算</Button>
    </div>
  );
};

export default Home;

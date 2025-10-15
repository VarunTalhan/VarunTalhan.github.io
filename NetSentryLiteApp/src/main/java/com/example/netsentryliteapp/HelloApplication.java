package com.example.netsentryliteapp;

import javafx.application.Application;
import javafx.stage.Stage;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;
import javafx.stage.FileChooser;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class HelloApplication extends Application {

    @Override
    public void start(Stage stage) {
        Label title = new Label("NetSentry Lite 🛡️");
        Button upload = new Button("Upload Network File (.csv)");
        Label result = new Label("Result: —");

        upload.setOnAction(e -> {
            FileChooser chooser = new FileChooser();
            chooser.getExtensionFilters()
                    .add(new FileChooser.ExtensionFilter("CSV files", "*.csv"));
            File file = chooser.showOpenDialog(stage);

            if (file != null) {
                try {
                    String prediction = sendToModel(file.getAbsolutePath());

                    // Extract JSON part from the response
                    String jsonPart = prediction.contains("{")
                            ? prediction.substring(prediction.indexOf("{"))
                            : prediction;

                    String summary = "Result unavailable";

                    // Try to extract the "summary" value
                    int start = jsonPart.indexOf("\"summary\":");
                    if (start != -1) {
                        int beginQuote = jsonPart.indexOf('"', start + 10) + 1;
                        int endQuote = jsonPart.indexOf('"', beginQuote);
                        if (beginQuote > 0 && endQuote > beginQuote) {
                            summary = jsonPart.substring(beginQuote, endQuote);
                        }
                    }

                    // Style and show the result
                    if (summary.toLowerCase().contains("0 attacks")) {
                        result.setStyle("-fx-text-fill: green; -fx-font-weight: bold;");
                        result.setText("✅ " + summary);
                    } else {
                        result.setStyle("-fx-text-fill: red; -fx-font-weight: bold;");
                        result.setText("🚨 " + summary);
                    }

                } catch (Exception ex) {
                    result.setStyle("-fx-text-fill: black;");
                    result.setText("Error: " + ex.getMessage());
                    ex.printStackTrace();
                }
            }
        });

        VBox layout = new VBox(15, title, upload, result);
        layout.setStyle("-fx-padding: 20; -fx-font-size: 16;");
        stage.setScene(new Scene(layout, 500, 220));
        stage.setTitle("NetSentry Lite");
        stage.show();
    }

    private String sendToModel(String path) throws Exception {
        // Convert Windows or WSL-style paths to real Linux paths
        String linuxPath = path;

        if (linuxPath.startsWith("\\\\wsl.localhost\\Ubuntu\\")) {
            linuxPath = linuxPath.replace("\\\\wsl.localhost\\Ubuntu\\", "/");
        } else if (linuxPath.startsWith("C:\\")) {
            linuxPath = linuxPath.replace("C:\\", "/mnt/c/");
        }

        linuxPath = linuxPath.replace("\\", "/");

        // URL of your FastAPI backend running in WSL
        URL url = new URL("http://172.21.204.173:8000/predict");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);

        String json = String.format("{\"file_path\": \"%s\"}", linuxPath);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(json.getBytes(StandardCharsets.UTF_8));
        }

        int status = conn.getResponseCode();
        InputStream stream = (status >= 200 && status < 300)
                ? conn.getInputStream()
                : conn.getErrorStream();

        BufferedReader br = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) sb.append(line);
        conn.disconnect();

        return "HTTP " + status + ": " + sb.toString();
    }

    public static void main(String[] args) {
        launch();
    }
}

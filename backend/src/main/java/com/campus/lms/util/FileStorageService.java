package com.campus.lms.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    private final Path basePath;
    private final String materialsDir;
    private final String submissionsDir;

    public FileStorageService(
            @Value("${app.storage.base-path}") String basePath,
            @Value("${app.storage.materials-dir}") String materialsDir,
            @Value("${app.storage.submissions-dir}") String submissionsDir
    ) {
        this.basePath = Paths.get(basePath).toAbsolutePath().normalize();
        this.materialsDir = materialsDir;
        this.submissionsDir = submissionsDir;
    }

    public StoredFile storeMaterial(MultipartFile file) throws IOException {
        return store(file, materialsDir);
    }

    public StoredFile storeSubmission(MultipartFile file) throws IOException {
        return store(file, submissionsDir);
    }

    private StoredFile store(MultipartFile file, String subDir) throws IOException {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex != -1) {
            extension = originalFilename.substring(dotIndex);
        }
        String filename = UUID.randomUUID() + extension;
        Path dir = basePath.resolve(subDir).normalize();
        Files.createDirectories(dir);
        Path target = dir.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        String checksum = computeChecksum(target);
        return new StoredFile(
                basePath.relativize(target).toString().replace('\\', '/'),
                file.getSize(),
                checksum
        );
    }

    public void delete(String relativePath) {
        if (!StringUtils.hasText(relativePath)) {
            return;
        }
        Path path = basePath.resolve(relativePath).normalize();
        try {
            Files.deleteIfExists(path);
        } catch (IOException e) {
            log.warn("Failed to delete file {}", path, e);
        }
    }

    public Path resolvePath(String relativePath) {
        if (!StringUtils.hasText(relativePath)) {
            throw new IllegalArgumentException("Relative path is required");
        }
        return basePath.resolve(relativePath).normalize();
    }

    private String computeChecksum(Path path) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = Files.readAllBytes(path);
            byte[] hash = digest.digest(bytes);
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    public record StoredFile(String relativePath, long size, String checksum) {
    }
}



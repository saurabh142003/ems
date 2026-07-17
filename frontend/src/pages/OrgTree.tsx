import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Avatar,
  CircularProgress,
  IconButton,
  Collapse,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import axiosInstance from "../api/axiosInstance";

interface TreeNode {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: string;
  department: string;
  designation: string;
  profileImage?: string;
  children: TreeNode[];
}

const OrgTreeNode: React.FC<{ node: TreeNode; depth: number }> = ({
  node,
  depth,
}) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <Box
      sx={{
        ml: depth * 4,
        position: "relative",
        pl: 2,
        borderLeft: depth > 0 ? "1px dashed #bdbdbd" : "none",
      }}
    >
      <Card
        sx={{
          display: "flex",
          alignItems: "center",
          p: 1.5,
          mb: 1.5,
          maxWidth: 450,
          borderRadius: 2,
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.05)",
          position: "relative",
        }}
      >
        <Avatar src={node.profileImage} sx={{ width: 44, height: 44, mr: 2 }}>
          {node.name.charAt(0)}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, lineHeight: 1.2 }}
          >
            {node.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.85rem" }}
          >
            {node.designation}
          </Typography>
          <Typography
            variant="caption"
            color="primary"
            sx={{ display: "block", mt: 0.2 }}
          >
            {node.department} • {node.role}
          </Typography>
        </Box>
        {hasChildren && (
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
      </Card>

      {hasChildren && (
        <Collapse in={expanded}>
          <Box sx={{ mt: 1 }}>
            {node.children.map((child) => (
              <OrgTreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

const OrgTree: React.FC = () => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await axiosInstance.get("/organization/tree");
        setTreeData(response.data.data);
      } catch (err: any) {
        setError(
          err.response?.data?.error || "Failed to fetch organization tree",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <AccountTreeIcon
          sx={{ fontSize: 32, color: "primary.main", mr: 1.5 }}
        />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Organizational Hierarchy Tree
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3, minHeight: "60vh" }}>
        {treeData.length > 0 ? (
          treeData.map((rootNode) => (
            <OrgTreeNode key={rootNode.id} node={rootNode} depth={0} />
          ))
        ) : (
          <Typography color="text.secondary" align="center" sx={{ py: 6 }}>
            No hierarchy data found.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default OrgTree;

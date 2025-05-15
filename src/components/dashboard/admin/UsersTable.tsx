
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at?: string;
}

interface UsersTableProps {
  profiles: UserProfile[];
}

export function UsersTable({ profiles }: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {profiles.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center">
              No users found
            </TableCell>
          </TableRow>
        ) : (
          profiles.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell>
                {`${profile.first_name || ""} ${profile.last_name || ""}`}
              </TableCell>
              <TableCell>{profile.email}</TableCell>
              <TableCell>
                {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

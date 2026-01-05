import { getPublic } from "@/utils/api/client/get";
import { staffEndpoints } from "@/utils/api/endpoints";
import { Staff } from "@/generated/prisma/client";
import { DataTable } from "@/components/common/dashboard/table/data-table";
import { staffColumns } from "./components/columns";
import { Plus } from "lucide-react";
import Breadcrumbs from "@/components/common/dashboard/breadcrumbs";
import { StaffTableRow } from "./types";
import { CreateStaffSidebar } from "./components/create-staff-sidebar";

export default async function StaffListPage(props: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const searchParams = await props.searchParams;
  const page = parseInt((searchParams.page as string) || "1");
  const response = await getPublic(
    `${staffEndpoints.getStaffList}?limit=10&page=${page}`
  );
  const staffList: StaffTableRow[] = response.data?.items ?? [];
  const pagination = response.data?.pagination;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Staff", href: "/staff" },
        ]}
      />
      <div className="p-6 mx-6 bg-white min-h-[85vh]">
        <div className="flex justify-end items-center mb-4">
          {/* <button className="px-2 py-1 bg-black text-white flex gap-1 items-center">
            <Plus size={16} /> Create
          </button> */}
          <CreateStaffSidebar />
        </div>
        <DataTable
          columns={staffColumns}
          data={staffList}
          pagination={pagination}
        />
      </div>
    </>
  );
}

class DistrictModel {
  bool? status;
  Pagination? pagination;
  DistrictModelData? data;
  String? message;

  DistrictModel({this.status, this.pagination, this.data, this.message});

  DistrictModel.fromJson(Map<String, dynamic> json) {
    status = json['status'];
    pagination = json['pagination'] != null
        ? new Pagination.fromJson(json['pagination'])
        : null;
    data = json['data'] != null
        ? new DistrictModelData.fromJson(json['data'])
        : null;
    message = json['message'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['status'] = this.status;
    if (this.pagination != null) {
      data['pagination'] = this.pagination!.toJson();
    }
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    data['message'] = this.message;
    return data;
  }
}

class Pagination {
  int? totalCount;

  Pagination({this.totalCount});

  Pagination.fromJson(Map<String, dynamic> json) {
    totalCount = json['totalCount'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['totalCount'] = this.totalCount;
    return data;
  }
}

class DistrictModelData {
  List<DistrictList>? list;

  DistrictModelData({this.list});

  DistrictModelData.fromJson(Map<String, dynamic> json) {
    if (json['list'] != null) {
      list = <DistrictList>[];
      json['list'].forEach((v) {
                  list!.add(new DistrictList.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.list != null) {
      data['list'] = this.list!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class DistrictList {
  Name? name;
  String? sId;
  Country? country;
  State1? state;
  String? createdBy;
  String? updatedBy;
  bool? isActive;
  String? createdAt;
  String? updatedAt;
  String? code;
  int? iV;
  String? id;

  DistrictList(
      {this.name,
      this.sId,
      this.country,
      this.state,
      this.createdBy,
      this.updatedBy,
      this.isActive,
      this.createdAt,
      this.updatedAt,
      this.code,
      this.iV,
      this.id});

  DistrictList.fromJson(Map<String, dynamic> json) {
    name = json['name'] != null ? new Name.fromJson(json['name']) : null;
    sId = json['_id'];
    country =
        json['country'] != null ? new Country.fromJson(json['country']) : null;
    state = json['state'] != null ? new State1.fromJson(json['state']) : null;
    createdBy = json['createdBy'];
    updatedBy = json['updatedBy'];
    isActive = json['isActive'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    code = json['code'];
    iV = json['__v'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.name != null) {
      data['name'] = this.name!.toJson();
    }
    data['_id'] = this.sId;
    if (this.country != null) {
      data['country'] = this.country!.toJson();
    }
    if (this.state != null) {
      data['state'] = this.state!.toJson();
    }
    data['createdBy'] = this.createdBy;
    data['updatedBy'] = this.updatedBy;
    data['isActive'] = this.isActive;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['code'] = this.code;
    data['__v'] = this.iV;
    data['id'] = this.id;
    return data;
  }
}

class Name {
  String? english;

  Name({this.english});

  Name.fromJson(Map<String, dynamic> json) {
    english = json['english'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['english'] = this.english;
    return data;
  }
}

class Country {
  Name? name;
  String? sId;
  String? createdBy;
  String? updatedBy;
  bool? isActive;
  String? createdAt;
  String? updatedAt;
  String? code;
  int? iV;
  String? id;

  Country(
      {this.name,
      this.sId,
      this.createdBy,
      this.updatedBy,
      this.isActive,
      this.createdAt,
      this.updatedAt,
      this.code,
      this.iV,
      this.id});

  Country.fromJson(Map<String, dynamic> json) {
    name = json['name'] != null ? new Name.fromJson(json['name']) : null;
    sId = json['_id'];
    createdBy = json['createdBy'];
    updatedBy = json['updatedBy'];
    isActive = json['isActive'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    code = json['code'];
    iV = json['__v'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.name != null) {
      data['name'] = this.name!.toJson();
    }
    data['_id'] = this.sId;
    data['createdBy'] = this.createdBy;
    data['updatedBy'] = this.updatedBy;
    data['isActive'] = this.isActive;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['code'] = this.code;
    data['__v'] = this.iV;
    data['id'] = this.id;
    return data;
  }
}

class State1 {
  Name? name;
  String? sId;
  String? country;
  String? createdBy;
  String? updatedBy;
  bool? isActive;
  String? createdAt;
  String? updatedAt;
  String? code;
  int? iV;
  String? id;

  State1(
      {this.name,
      this.sId,
      this.country,
      this.createdBy,
      this.updatedBy,
      this.isActive,
      this.createdAt,
      this.updatedAt,
      this.code,
      this.iV,
      this.id});

  State1.fromJson(Map<String, dynamic> json) {
    name = json['name'] != null ? new Name.fromJson(json['name']) : null;
    sId = json['_id'];
    country = json['country'];
    createdBy = json['createdBy'];
    updatedBy = json['updatedBy'];
    isActive = json['isActive'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    code = json['code'];
    iV = json['__v'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.name != null) {
      data['name'] = this.name!.toJson();
    }
    data['_id'] = this.sId;
    data['country'] = this.country;
    data['createdBy'] = this.createdBy;
    data['updatedBy'] = this.updatedBy;
    data['isActive'] = this.isActive;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['code'] = this.code;
    data['__v'] = this.iV;
    data['id'] = this.id;
    return data;
  }
}
